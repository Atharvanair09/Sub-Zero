const transactionRepository = require('../repositories/TransactionRepository');
const subscriptionRepository = require('../repositories/SubscriptionRepository');
const notificationRepository = require('../repositories/NotificationRepository');
const incomeRepository = require('../repositories/IncomeRepository');
const incomeCycleRepository = require('../repositories/IncomeCycleRepository');
const goalAllocationRepository = require('../repositories/GoalAllocationRepository');
const goalRepository = require('../repositories/GoalRepository');
const budgetRepository = require('../repositories/BudgetRepository');
const { getCycleIdentifier } = require('../utils/incomeCycleUtils');

class TransactionPipelineService {
  static async autoProcessPastCycle(userId, transactionId, source, txnDate, actualAmount, cycleId) {
    const allocations = await goalAllocationRepository.findMany({ incomeSourceId: source._id, status: 'active' });
    let totalAllocations = 0;
    
    for (let alloc of allocations) {
      const amountToAdd = alloc.allocationType === 'fixed' ? alloc.amountOrPercentage : (actualAmount * alloc.amountOrPercentage) / 100;
      totalAllocations += amountToAdd;
      await goalRepository.findByIdAndUpdate(alloc.goalId, { $inc: { currentAmount: amountToAdd } });
    }

    const budgets = await budgetRepository.findMany({ userId });
    let budgetReservations = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);

    await incomeCycleRepository.create({
      userId,
      incomeSourceId: source._id,
      transactionId,
      cycleIdentifier: cycleId,
      cycleDate: txnDate,
      actualAmount: actualAmount,
      expectedAmount: source.amount,
      goalAllocations: totalAllocations,
      budgetReservations: budgetReservations,
      totalExpenses: 0,
      status: 'processed'
    });

    const freshSource = await incomeRepository.findById(source._id);
    if (!freshSource.lastReceivedDate || new Date(txnDate) > new Date(freshSource.lastReceivedDate)) {
      await incomeRepository.updateOne({ _id: source._id }, { $set: { lastReceivedDate: txnDate } });
    }
    console.log(`[Income Pipeline] Successfully auto-processed cycle ${cycleId} for source ${source.name}. Allocated: ₹${totalAllocations}`);
  }

  static async processEmail({ userId, msgId, emailDate, subject, snippet, fullBody, headers, autoSave, detected }) {
    const { parseEmail, extractCreditSender, validateTransactionEmail } = require("../../src/parser/index");
    const { categorizeTransaction } = require("../../src/parser/categorizer");
    
    const textToScan = subject + " " + snippet + " " + fullBody;
    const validationResult = validateTransactionEmail(subject, snippet, fullBody);
    
    if (!validationResult.isValidTransaction) {
      const senderHeader = headers.find(h => h.name === 'From');
      const sender = senderHeader ? senderHeader.value : "Unknown";
      console.log(`[Gmail Scan] Skipped Email:`);
      console.log(`  - Message ID: ${msgId}`);
      console.log(`  - Subject: ${subject}`);
      console.log(`  - Sender: ${sender}`);
      console.log(`  - Reason: ${validationResult.reason}`);
      console.log(`  - Classification: ${validationResult.classification}`);
      return;
    }

    const parsed = parseEmail(textToScan);
    
    let vendorName = null;
    let type = 'debit';
    let domain = "hdfcbank.com";
    let price = "0";

    if (parsed.displayTitle !== "Unknown Transaction" && parsed.confidence > 0) {
       vendorName = parsed.displayTitle.toUpperCase();
       type = parsed.transactionType.toLowerCase();
       price = parsed.amount ? parsed.amount : "0";
       
       if (type === 'credit') {
           const creditData = extractCreditSender(textToScan);
           if (creditData.displayTitle !== "Unknown Sender") {
               vendorName = creditData.displayTitle.toUpperCase();
           }
       }
    } else {
       // Fallback to simple detection
       if (/\b(credited|credit|received|refunded|deposited|reversal)\b/i.test(textToScan)) {
          type = 'credit';
          const creditData = extractCreditSender(textToScan);
          if (creditData.displayTitle !== "Unknown Sender") {
               vendorName = creditData.displayTitle.toUpperCase();
          } else {
               vendorName = 'HDFC CREDIT';
          }
       } else {
          type = 'debit';
          vendorName = 'HDFC DEBIT';
       }
    }

    // If price is still "0" or null, try extracting it manually (useful for generic VPAs where we didn't extract amount)
    if (!price || price === "0") {
       const priceMatch = textToScan.match(/(?:₹|\$|rs\.?|usd|inr)\s?(\d+(?:[.,]\d{2})?)/i);
       price = priceMatch ? priceMatch[1] : "0";
    }

    console.log(`[Gmail Scan] Parsing email ID: ${msgId} | Detected Type: ${type}`);
    
    let category = "Others";
    if (vendorName) {
      category = categorizeTransaction(vendorName, textToScan);
      console.log(`[Gmail Scan] Parsed Alert details - Vendor: ${vendorName} | Price: ${price} | Category: ${category} | Type: ${type}`);

      // Filter out if already added as a subscription or transaction
      const alreadyExistsInSub = await subscriptionRepository.findOne({ userId, externalId: msgId });
      const alreadyExistsInTxn = await transactionRepository.findOne({ userId, externalId: msgId });

      // Semantic deduplication: Check for same amount, name, type within a 2-hour window
      const windowStart = new Date(emailDate.getTime() - 2 * 60 * 60 * 1000);
      const windowEnd = new Date(emailDate.getTime() + 2 * 60 * 60 * 1000);
      const numericPrice = parseFloat(price.replace(',', ''));

      // More robust deduplication logic to catch bank alerts vs specific merchant receipts
      const potentialDuplicates = await transactionRepository.findMany({
          userId,
          amount: numericPrice,
          type: type,
          date: { $gte: windowStart, $lte: windowEnd }
      });

      let duplicateTxn = null;
      for (const pt of potentialDuplicates) {
          const name1 = vendorName.toLowerCase();
          const name2 = pt.name.toLowerCase();
          if (name1 === name2 || name1.includes(name2) || name2.includes(name1) || 
              name1.includes('hdfc') || name2.includes('hdfc') || name1.includes('unknown') || name2.includes('unknown') ||
              name1.includes('upi') || name2.includes('upi')) {
              duplicateTxn = pt;
              
              // If the incoming transaction has a better/more specific name, update the generic one
              const newIsGeneric = name1.includes('hdfc') || name1.includes('unknown') || name1.includes('upi');
              const oldIsGeneric = name2.includes('hdfc') || name2.includes('unknown') || name2.includes('upi');
              
              if (oldIsGeneric && !newIsGeneric) {
                  pt.name = vendorName;
                  pt.category = category;
                  if (autoSave === 'true') {
                      await transactionRepository.updateOne({ _id: pt._id }, { $set: { name: vendorName, category: category } });
                  }
              }
              break;
          }
      }

      let alreadyInDetected = null;
      for (const d of detected) {
          if (parseFloat(d.price) === numericPrice && d.type === type && Math.abs(d.date - emailDate.getTime()) < 2 * 60 * 60 * 1000) {
              const name1 = vendorName.toLowerCase();
              const name2 = d.name.toLowerCase();
              if (name1 === name2 || name1.includes(name2) || name2.includes(name1) || 
                  name1.includes('hdfc') || name2.includes('hdfc') || name1.includes('unknown') || name2.includes('unknown') ||
                  name1.includes('upi') || name2.includes('upi')) {
                  alreadyInDetected = d;
                  
                  const newIsGeneric = name1.includes('hdfc') || name1.includes('unknown') || name1.includes('upi');
                  const oldIsGeneric = name2.includes('hdfc') || name2.includes('unknown') || name2.includes('upi');
                  if (oldIsGeneric && !newIsGeneric) {
                      d.name = vendorName;
                      d.category = category;
                  }
                  break;
              }
          }
      }

      if (!alreadyExistsInSub && !alreadyExistsInTxn && !duplicateTxn && !alreadyInDetected) {
         if (autoSave === 'true') {
           const newTxn = await transactionRepository.create({
             userId,
             name: vendorName,
             amount: numericPrice,
             category: category,
             logo: `https://www.google.com/s2/favicons?sz=128&domain=${domain}`,
             externalId: msgId,
             type: type,
             date: emailDate
           });

           // Check if it matches an Income Source
           if (type === 'credit') {
             const sources = await incomeRepository.findMany({ userId, status: 'active' });
             
             const match = sources.find(s => {
               const expectedSender = (s.expectedSender || s.name).toLowerCase();
               // Strip generic keywords
               const cleanExpected = expectedSender.replace(/\b(upi|hdfc|bank)\b/gi, '').trim();
               const cleanVendor = vendorName.toLowerCase().replace(/\b(upi|hdfc|bank)\b/gi, '').trim();
               const isMatch = cleanVendor.includes(cleanExpected) || cleanExpected.includes(cleanVendor);
               console.log(`[Income Pipeline] Match check - Expected: '${cleanExpected}', Vendor: '${cleanVendor}', Matched: ${isMatch}`);
               return isMatch;
             });
             
             if (match) {
               const cycleId = getCycleIdentifier(match.frequency, emailDate);
               const existingCycle = await incomeCycleRepository.findOne({ 
                 incomeSourceId: match._id, 
                 cycleIdentifier: cycleId, 
                 status: 'processed' 
               });
               
               if (!existingCycle) {
                   console.log(`[Income Pipeline] No existing cycle found for ${cycleId}, checking amount difference.`);
                   
                   if (Math.abs(match.amount - numericPrice) <= 100) {
                       console.log(`[Income Pipeline] Amount matches expected (diff <= 100). Auto-processing cycle ${cycleId}.`);
                       await TransactionPipelineService.autoProcessPastCycle(userId, newTxn._id, match, emailDate, numericPrice, cycleId);
                   } else {
                       console.log(`[Income Pipeline] Amount mismatch. Expected ₹${match.amount}, Got ₹${numericPrice}. Requesting verification.`);
                       await notificationRepository.findOneAndUpdate(
                         { userId, type: 'income_verification', transactionId: newTxn._id },
                         { 
                           title: `Unusual Income Amount`,
                           message: `Received ₹${numericPrice} from ${vendorName}. Expected ₹${match.amount}. Is this your ${match.name} income?`,
                           priority: 'high',
                           transactionId: newTxn._id,
                           incomeSourceId: match._id,
                           metaData: { cycleIdentifier: cycleId, expectedAmount: match.amount, transactionAmount: numericPrice }
                         },
                         { upsert: true }
                       );
                   }
               } else {
                   console.log(`[Income Pipeline] Cycle ${cycleId} already processed. Treated as normal credit.`);
               }
               // If existingCycle exists, it's treated as normal credit.
             } else {
               // Time-based heuristic fallback if sender didn't match
               console.log(`[Income Pipeline] No sender match. Falling back to time-based heuristic.`);
               for (const s of sources) {
                 const lastCycle = await incomeCycleRepository.findOne({ incomeSourceId: s._id, status: 'processed' }, null, { sort: { cycleDate: -1 } });
                 let referenceDate = null;
                 if (lastCycle) {
                   referenceDate = new Date(lastCycle.cycleDate);
                 } else if (s.nextExpectedDate) {
                   referenceDate = new Date(s.nextExpectedDate);
                   if (s.frequency === 'monthly') referenceDate.setMonth(referenceDate.getMonth() - 1);
                   else if (s.frequency === 'biweekly') referenceDate.setDate(referenceDate.getDate() - 14);
                   else if (s.frequency === 'weekly') referenceDate.setDate(referenceDate.getDate() - 7);
                 } else {
                   referenceDate = new Date(s.createdAt);
                 }
                 
                 if (referenceDate) {
                   const daysDiff = (emailDate.getTime() - referenceDate.getTime()) / (1000 * 3600 * 24);
                   let isTimeMatch = false;
                   
                   if (s.frequency === 'monthly' && daysDiff >= 26 && daysDiff <= 35) {
                     isTimeMatch = true;
                   } else if (s.frequency === 'weekly' && daysDiff >= 5 && daysDiff <= 9) {
                     isTimeMatch = true;
                   } else if (s.frequency === 'biweekly' && daysDiff >= 12 && daysDiff <= 16) {
                     isTimeMatch = true;
                   }
                   
                   if (isTimeMatch) {
                     console.log(`[Income Pipeline] Time-based match found for source ${s.name} (daysDiff: ${daysDiff.toFixed(1)}). Requesting verification.`);
                     const cycleId = getCycleIdentifier(s.frequency, emailDate);
                     const existingCycle = await incomeCycleRepository.findOne({ 
                       incomeSourceId: s._id, 
                       cycleIdentifier: cycleId, 
                       status: 'processed' 
                     });
                     
                     if (!existingCycle) {
                        if (Math.abs(s.amount - numericPrice) <= 100) {
                            console.log(`[Income Pipeline] Amount matches expected (diff <= 100) in fallback. Auto-processing cycle ${cycleId}.`);
                            await TransactionPipelineService.autoProcessPastCycle(userId, newTxn._id, s, emailDate, numericPrice, cycleId);
                        } else {
                          console.log(`[Income Pipeline] Amount mismatch in fallback. Requesting verification.`);
                          await notificationRepository.findOneAndUpdate(
                            { userId, type: 'income_verification', transactionId: newTxn._id },
                         { 
                           title: `Potential Income Detected`,
                           message: `Received ₹${numericPrice} from ${vendorName}. It's time for your ${s.name} income. Is this it?`,
                           priority: 'high',
                           transactionId: newTxn._id,
                           incomeSourceId: s._id,
                           metaData: { cycleIdentifier: cycleId, expectedAmount: s.amount, transactionAmount: numericPrice }
                         },
                         { upsert: true }
                       );
                        }
                        break; // Stop after finding the first probable time-based match
                     }
                   }
                 }
               }
             }
           }
         }

         detected.push({
           name: vendorName,
           price: price.replace(',', ''),
           plan: 'Detected Alert',
           category: category,
           logo: `https://www.google.com/s2/favicons?sz=128&domain=${domain}`,
           detectedFrom: headers.find(h => h.name === 'Subject')?.value || "Bank Alert",
           date: emailDate.getTime(),
           externalId: msgId,
           type: type
         });
      }
    }
  }
}

module.exports = TransactionPipelineService;
