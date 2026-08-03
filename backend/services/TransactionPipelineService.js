const transactionRepository = require('../repositories/TransactionRepository');
const subscriptionRepository = require('../repositories/SubscriptionRepository');
const notificationRepository = require('../repositories/NotificationRepository');
const incomeRepository = require('../repositories/IncomeRepository');
const incomeCycleRepository = require('../repositories/IncomeCycleRepository');
const goalAllocationRepository = require('../repositories/GoalAllocationRepository');
const goalRepository = require('../repositories/GoalRepository');
const budgetRepository = require('../repositories/BudgetRepository');

const DateCycleEngine = require('../domain/engines/DateCycleEngine');
const CategorizationEngine = require('../domain/engines/CategorizationEngine');
const MerchantNormalizationEngine = require('../domain/engines/MerchantNormalizationEngine');
const TransactionParsingEngine = require('../domain/engines/TransactionParsingEngine');
const DuplicateDetectionEngine = require('../domain/engines/DuplicateDetectionEngine');
const IncomeDetectionEngine = require('../domain/engines/IncomeDetectionEngine');
const IncomeCycleEngine = require('../domain/engines/IncomeCycleEngine');
const GoalAllocationEngine = require('../domain/engines/GoalAllocationEngine');
const BudgetAllocationEngine = require('../domain/engines/BudgetAllocationEngine');

class TransactionPipelineService {
  static async autoProcessPastCycle(userId, transactionId, source, txnDate, actualAmount, cycleId) {
    const allocations = await goalAllocationRepository.findMany({ incomeSourceId: source._id, status: 'active' });
    
    const totalAllocations = GoalAllocationEngine.calculateTotalAllocatedAmount(allocations, actualAmount);
    
    for (let alloc of allocations) {
      const amountToAdd = GoalAllocationEngine.calculateAmountToAdd(alloc, actualAmount);
      await goalRepository.findByIdAndUpdate(alloc.goalId, { $inc: { currentAmount: amountToAdd } });
    }

    const budgets = await budgetRepository.findMany({ userId });
    const budgetReservations = BudgetAllocationEngine.calculateTotalReservations(budgets);

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
    const lastReceived = freshSource.lastReceivedDate;
    if (!lastReceived || new Date(txnDate) > new Date(lastReceived)) {
      await incomeRepository.updateOne({ _id: source._id }, { $set: { lastReceivedDate: txnDate } });
    }
    console.log(`[Income Pipeline] Successfully auto-processed cycle ${cycleId} for source ${source.name}. Allocated: ₹${totalAllocations}`);
  }

  static async processEmail({ userId, msgId, emailDate, subject, snippet, fullBody, headers, autoSave, detected }) {
    const { parseEmail, extractCreditSender, validateTransactionEmail } = require("../../src/parser/index");
    
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
       type = TransactionParsingEngine.detectTypeFallback(textToScan);
       if (type === 'credit') {
          const creditData = extractCreditSender(textToScan);
          if (creditData.displayTitle !== "Unknown Sender") {
               vendorName = creditData.displayTitle.toUpperCase();
          } else {
               vendorName = 'HDFC CREDIT';
          }
       } else {
          vendorName = 'HDFC DEBIT';
       }
    }

    if (!price || price === "0") {
       price = TransactionParsingEngine.extractPrice(textToScan);
    }

    console.log(`[Gmail Scan] Parsing email ID: ${msgId} | Detected Type: ${type}`);
    
    let category = "Others";
    if (vendorName) {
      category = CategorizationEngine.getTransactionCategory(vendorName, textToScan);
      console.log(`[Gmail Scan] Parsed Alert details - Vendor: ${vendorName} | Price: ${price} | Category: ${category} | Type: ${type}`);

      const alreadyExistsInSub = await subscriptionRepository.findOne({ userId, externalId: msgId });
      const alreadyExistsInTxn = await transactionRepository.findOne({ userId, externalId: msgId });

      const numericPrice = parseFloat(price.replace(',', ''));
      const window = DateCycleEngine.getDeduplicationWindow(emailDate);

      const potentialDuplicates = await transactionRepository.findMany({
          userId,
          amount: numericPrice,
          type: type,
          date: { $gte: window.windowStart, $lte: window.windowEnd }
      });

      let duplicateTxn = null;
      for (const pt of potentialDuplicates) {
          if (DuplicateDetectionEngine.isSemanticDuplicate(vendorName, pt.name, type, pt.type, numericPrice, pt.amount)) {
              duplicateTxn = pt;
              const betterName = MerchantNormalizationEngine.getMostSpecificName(vendorName, pt.name);
              
              if (betterName === vendorName && pt.name !== vendorName) {
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
          if (DateCycleEngine.isWithinDetectionWindow(d.date, emailDate.getTime())) {
              if (DuplicateDetectionEngine.isSemanticDuplicate(vendorName, d.name, type, d.type, numericPrice, d.price)) {
                  alreadyInDetected = d;
                  const betterName = MerchantNormalizationEngine.getMostSpecificName(vendorName, d.name);
                  if (betterName === vendorName && d.name !== vendorName) {
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

           if (type === 'credit') {
             const sources = await incomeRepository.findMany({ userId, status: 'active' });
             
             const match = sources.find(s => {
               const expectedSender = s.expectedSender || s.name;
               const isMatch = IncomeDetectionEngine.isSourceMatch(vendorName, expectedSender);
               console.log(`[Income Pipeline] Match check - Expected: '${expectedSender}', Vendor: '${vendorName}', Matched: ${isMatch}`);
               return isMatch;
             });
             
             if (match) {
               const cycleId = IncomeCycleEngine.getCycleId(match.frequency, emailDate);
               const existingCycle = await incomeCycleRepository.findOne({ 
                 incomeSourceId: match._id, 
                 cycleIdentifier: cycleId, 
                 status: 'processed' 
               });
               
               if (!existingCycle) {
                   console.log(`[Income Pipeline] No existing cycle found for ${cycleId}, checking amount difference.`);
                   
                   if (IncomeDetectionEngine.isAmountMatch(numericPrice, match.amount)) {
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
             } else {
               console.log(`[Income Pipeline] No sender match. Falling back to time-based heuristic.`);
               for (const s of sources) {
                 const lastCycle = await incomeCycleRepository.findOne({ incomeSourceId: s._id, status: 'processed' }, null, { sort: { cycleDate: -1 } });
                 const referenceDate = DateCycleEngine.getIncomeReferenceDate(
                     lastCycle ? lastCycle.cycleDate : null, 
                     s.nextExpectedDate, 
                     s.createdAt, 
                     s.frequency
                 );
                 
                 if (referenceDate) {
                   const daysDiff = DateCycleEngine.getDaysDifference(emailDate, referenceDate);
                   const isTimeMatch = DateCycleEngine.isIncomeTimeMatch(s.frequency, daysDiff);
                   
                   if (isTimeMatch) {
                     console.log(`[Income Pipeline] Time-based match found for source ${s.name} (daysDiff: ${daysDiff.toFixed(1)}). Requesting verification.`);
                     const cycleId = IncomeCycleEngine.getCycleId(s.frequency, emailDate);
                     const existingCycle = await incomeCycleRepository.findOne({ 
                       incomeSourceId: s._id, 
                       cycleIdentifier: cycleId, 
                       status: 'processed' 
                     });
                     
                     if (!existingCycle) {
                        if (IncomeDetectionEngine.isAmountMatch(numericPrice, s.amount)) {
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
                        break;
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
