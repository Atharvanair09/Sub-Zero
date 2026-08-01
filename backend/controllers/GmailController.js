const { google } = require("googleapis");
const gmailSyncRepository = require('../repositories/GmailSyncRepository');
const userRepository = require('../repositories/UserRepository');
const transactionRepository = require('../repositories/TransactionRepository');
const subscriptionRepository = require('../repositories/SubscriptionRepository');
const notificationRepository = require('../repositories/NotificationRepository');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID.trim(),
  process.env.GOOGLE_CLIENT_SECRET.trim(),
  process.env.GOOGLE_REDIRECT_URI.trim()
);

class GmailController {
  static async getStatus(req, res) {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, error: "userId is required" });
    }
    try {
      const user = await gmailSyncRepository.findById(userId, "gmailConnected googleTokens");
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }
      res.json({
        success: true,
        gmailConnected: user.gmailConnected ?? false,
        hasTokens: !!(user.googleTokens?.access_token),
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static getAuthUrl(req, res) {
    const { userId } = req.query;
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent", // Force new refresh token
      scope: ["https://www.googleapis.com/auth/gmail.readonly"],
      redirect_uri: process.env.GOOGLE_REDIRECT_URI.trim(),
      state: userId // Pass userId in state
    });
    console.log("Generated Auth URL:", url);
    res.json({ url });
  }

  static async authCallback(req, res) {
    const { code, state, error, error_description } = req.query; // state is the canonical userId (_id)
    console.log(`[Google OAuth Callback] Code received: ${code ? "YES" : "NO"}, State (UserId): ${state}`);
    
    if (error || error_description) {
      console.error(`[Google OAuth Callback] Google returned an OAuth error: ${error} - ${error_description}`);
    }

    if (!code) {
      console.error("[Google OAuth Callback] Error: No code received in query parameters. Query params:", req.query);
      return res.status(400).send(`Authentication failed: ${error_description || error || "Missing authorization code"}`);
    }

    try {
      const { tokens } = await oauth2Client.getToken(code);
      
      console.log("[Google OAuth Callback] Exchanged tokens characteristics:", {
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
        expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : "N/A",
        scopes: tokens.scope
      });

      if (!tokens.refresh_token) {
        console.warn("[Google OAuth Callback] WARNING: No refresh_token returned from Google. If this is a subsequent login, Google will not return a refresh_token unless prompt=consent is enforced.");
      }

      if (state) {
        await gmailSyncRepository.updateById(state, {
          googleTokens: tokens,
          gmailConnected: true, // Mark Gmail as connected once we have valid tokens
        });
        console.log(`[Google OAuth Callback] Successfully saved new Google tokens for userId: ${state}`);
      }

      const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").trim();
      const redirectUrl = `${frontendUrl}/?scan=true`;
      console.log(`[Google OAuth Callback] Redirecting user to: ${redirectUrl}`);
      res.redirect(redirectUrl);
    } catch (err) {
      console.error("[Google OAuth Callback] Error exchanging code for tokens:", err);
      res.status(500).send("Authentication failed");
    }
  }

  static async autoProcessPastCycle(userId, transactionId, source, txnDate, actualAmount, cycleId) {
    const incomeCycleRepository = require('../repositories/IncomeCycleRepository');
    const goalAllocationRepository = require('../repositories/GoalAllocationRepository');
    const goalRepository = require('../repositories/GoalRepository');
    const budgetRepository = require('../repositories/BudgetRepository');
    const incomeRepository = require('../repositories/IncomeRepository');

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

  static async scan(req, res) {
    const { userId, autoSave, accessToken, limit } = req.query;
    const maxResults = limit ? parseInt(limit, 10) : 50;
    console.log(`[Gmail Scan] Initiated scan for userId: ${userId}, autoSave: ${autoSave}, limit: ${maxResults}`);
    try {
      const user = await userRepository.findById(userId);

      if (!user) {
        console.error(`[Gmail Scan] Scan failed: User with ID ${userId} not found in database.`);
        return res.status(404).json({ error: "User not found" });
      }

      // Gate: user must have explicitly connected Gmail AND have a valid access token.
      // Return 200 with skipped:true (not 401) so callers can distinguish
      // "not connected yet" from "token expired" — avoiding noise in logs and UI.
      if (!accessToken && (!user.gmailConnected || !user.googleTokens?.access_token)) {
        console.log(`[Gmail Scan] Skipped: user ${userId} has not connected Gmail (gmailConnected=${user.gmailConnected}).`);
        return res.status(200).json({ success: true, detected: [], skipped: true });
      }

      if (accessToken) {
        oauth2Client.setCredentials({ access_token: accessToken });
        console.log("[Gmail Scan] Credentials set on oauth2Client from query accessToken successfully.");
        
        if (!user.gmailConnected) {
          await gmailSyncRepository.updateById(userId, { gmailConnected: true });
        }
      } else {
        console.log(`[Gmail Scan] Retrieved tokens for user ${userId} from DB:`, {
          hasAccessToken: !!user.googleTokens.access_token,
          hasRefreshToken: !!user.googleTokens.refresh_token,
          expiryDate: user.googleTokens.expiry_date ? new Date(user.googleTokens.expiry_date).toISOString() : "N/A",
        });

        oauth2Client.setCredentials(user.googleTokens);
        console.log("[Gmail Scan] Credentials set on oauth2Client successfully.");
      }

      const gmail = google.gmail({ version: "v1", auth: oauth2Client });
      const response = await gmail.users.messages.list({
        userId: "me",
        q: `from:${process.env.BANK_ALERT_EMAIL}`,
        maxResults: maxResults,
      });

      const messages = response.data.messages || [];
      const detected = [];

      console.log(`[Gmail Scan] Found ${messages.length} potential emails to analyze.`);

      // Bulk check for existing transactions/subscriptions to avoid rescanning
      const messageIds = messages.map(m => m.id);
      const existingTxns = await transactionRepository.findMany({ userId, externalId: { $in: messageIds } }, { projection: 'externalId', lean: true });
      const existingSubs = await subscriptionRepository.findMany({ userId, externalId: { $in: messageIds } }, { projection: 'externalId', lean: true });
      
      const existingIds = new Set([
        ...existingTxns.map(t => t.externalId),
        ...existingSubs.map(s => s.externalId)
      ]);
      
      const newMessages = messages.filter(m => !existingIds.has(m.id)).reverse();
      console.log(`[Gmail Scan] Skipping ${existingIds.size} already processed emails. ${newMessages.length} new emails to parse.`);

      for (const msg of newMessages) {
        const details = await gmail.users.messages.get({
          userId: "me",
          id: msg.id,
        });

        function getEmailBody(payload) {
          let body = '';
          if (payload.parts) {
            for (let part of payload.parts) {
              if (part.mimeType === 'text/plain' && part.body && part.body.data) {
                body += Buffer.from(part.body.data, 'base64').toString('utf8') + ' ';
              } else if (part.mimeType === 'text/html' && part.body && part.body.data) {
                body += Buffer.from(part.body.data, 'base64').toString('utf8') + ' ';
              } else if (part.parts) {
                body += getEmailBody(part) + ' ';
              }
            }
          } else if (payload.body && payload.body.data) {
            body += Buffer.from(payload.body.data, 'base64').toString('utf8');
          }
          return body;
        }

        const snippet = details.data.snippet ? details.data.snippet.toLowerCase() : "";
        const subjectHeader = details.data.payload.headers.find(h => h.name === 'Subject');
        const subject = subjectHeader ? subjectHeader.value.toLowerCase() : "";
        const fullBody = getEmailBody(details.data.payload).toLowerCase();
        const textToScan = subject + " " + snippet + " " + fullBody;

        const { parseEmail, extractCreditSender, validateTransactionEmail } = require("../src/parser/index");
        const { categorizeTransaction } = require("../src/parser/categorizer");
        
        const validationResult = validateTransactionEmail(subject, snippet, fullBody);
        if (!validationResult.isValidTransaction) {
          const senderHeader = details.data.payload.headers.find(h => h.name === 'From');
          const sender = senderHeader ? senderHeader.value : "Unknown";
          console.log(`[Gmail Scan] Skipped Email:`);
          console.log(`  - Message ID: ${msg.id}`);
          console.log(`  - Subject: ${subjectHeader ? subjectHeader.value : "None"}`);
          console.log(`  - Sender: ${sender}`);
          console.log(`  - Reason: ${validationResult.reason}`);
          console.log(`  - Classification: ${validationResult.classification}`);
          continue;
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

        console.log(`[Gmail Scan] Parsing email ID: ${msg.id} | Detected Type: ${type}`);
        
        let category = "Others";
        if (vendorName) {
          category = categorizeTransaction(vendorName, textToScan);
          console.log(`[Gmail Scan] Parsed Alert details - Vendor: ${vendorName} | Price: ${price} | Category: ${category} | Type: ${type}`);

          // Filter out if already added as a subscription or transaction
          
          const alreadyExistsInSub = await subscriptionRepository.findOne({ userId, externalId: msg.id });
          const alreadyExistsInTxn = await transactionRepository.findOne({ userId, externalId: msg.id });

          // Semantic deduplication: Check for same amount, name, type within a 2-hour window
          const emailDate = new Date(parseInt(details.data.internalDate));
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
                 externalId: msg.id,
                 type: type,
                 date: emailDate
               });

               // Check if it matches an Income Source
               if (type === 'credit') {
                 const incomeRepository = require('../repositories/IncomeRepository');
                 const incomeCycleRepository = require('../repositories/IncomeCycleRepository');
                 const { getCycleIdentifier } = require('../utils/incomeCycleUtils');
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
                           await GmailController.autoProcessPastCycle(userId, newTxn._id, match, emailDate, numericPrice, cycleId);
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
                                await GmailController.autoProcessPastCycle(userId, newTxn._id, s, emailDate, numericPrice, cycleId);
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
               detectedFrom: details.data.payload.headers.find(h => h.name === 'Subject')?.value || "Bank Alert",
               date: emailDate.getTime(),
               externalId: msg.id,
               type: type
             });
          }
        }
      }

      res.json({ success: true, detected });
    } catch (error) {
      console.error("[Gmail Scan] Scan failed with error:", error);
      let responseDataStr = "";
      if (error.response?.data) {
        try {
          responseDataStr = JSON.stringify(error.response.data);
        } catch (_) {
          responseDataStr = String(error.response.data);
        }
      }

      const errString = [
        error.message,
        error.stack,
        error.code,
        error.response?.status,
        responseDataStr,
        error.toString()
      ].filter(Boolean).join(" ").toLowerCase();

      console.error(`[Gmail Scan] Full error log: ${errString}`);

      if (errString.includes("no refresh token") || errString.includes("invalid_grant")) {
        console.warn(`[Gmail Scan] Detected invalid_grant or missing refresh token for user ${userId}. Clearing stored credentials from DB.`);
        if (userId) {
           try {
             // Clear both the tokens and the connected flag so the UI re-prompts OAuth
             await gmailSyncRepository.updateById(userId, { googleTokens: null, gmailConnected: false });
             console.log(`[Gmail Scan] Successfully cleared googleTokens and gmailConnected for user ${userId}.`);
           } catch (dbErr) {
             console.error(`[Gmail Scan] Failed to clear googleTokens for user ${userId}:`, dbErr);
           }
        }
        return res.status(401).json({ error: "Google authentication expired. Please re-authenticate." });
      }
      res.status(500).json({ error: "Failed to scan Gmail" });
    }
  }
}

module.exports = GmailController;
