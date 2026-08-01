const { google } = require("googleapis");
const gmailSyncRepository = require('../repositories/GmailSyncRepository');
const userRepository = require('../repositories/UserRepository');
const transactionRepository = require('../repositories/TransactionRepository');
const subscriptionRepository = require('../repositories/SubscriptionRepository');
const TransactionPipelineService = require('./TransactionPipelineService');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID.trim(),
  process.env.GOOGLE_CLIENT_SECRET.trim(),
  process.env.GOOGLE_REDIRECT_URI.trim()
);

class GmailSyncService {
  static async getStatus(userId) {
    if (!userId) {
      throw new Error("userId is required");
    }
    const user = await gmailSyncRepository.findById(userId, "gmailConnected googleTokens");
    if (!user) {
      throw new Error("User not found");
    }
    return {
      gmailConnected: user.gmailConnected ?? false,
      hasTokens: !!(user.googleTokens?.access_token),
    };
  }

  static getAuthUrl(userId) {
    return oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["https://www.googleapis.com/auth/gmail.readonly"],
      redirect_uri: process.env.GOOGLE_REDIRECT_URI.trim(),
      state: userId
    });
  }

  static async exchangeToken(code, state) {
    const { tokens } = await oauth2Client.getToken(code);
    if (state) {
      await gmailSyncRepository.updateById(state, {
        googleTokens: tokens,
        gmailConnected: true,
      });
    }
    return tokens;
  }

  static async scan({ userId, autoSave, accessToken, limit }) {
    const maxResults = limit ? parseInt(limit, 10) : 50;
    
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (!accessToken && (!user.gmailConnected || !user.googleTokens?.access_token)) {
      return { skipped: true, detected: [] };
    }

    if (accessToken) {
      oauth2Client.setCredentials({ access_token: accessToken });
      if (!user.gmailConnected) {
        await gmailSyncRepository.updateById(userId, { gmailConnected: true });
      }
    } else {
      oauth2Client.setCredentials(user.googleTokens);
    }

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const response = await gmail.users.messages.list({
      userId: "me",
      q: `from:${process.env.BANK_ALERT_EMAIL}`,
      maxResults: maxResults,
    });

    const messages = response.data.messages || [];
    const detected = [];

    // Bulk check for existing transactions/subscriptions to avoid rescanning
    const messageIds = messages.map(m => m.id);
    const existingTxns = await transactionRepository.findMany({ userId, externalId: { $in: messageIds } }, { projection: 'externalId', lean: true });
    const existingSubs = await subscriptionRepository.findMany({ userId, externalId: { $in: messageIds } }, { projection: 'externalId', lean: true });
    
    const existingIds = new Set([
      ...existingTxns.map(t => t.externalId),
      ...existingSubs.map(s => s.externalId)
    ]);
    
    const newMessages = messages.filter(m => !existingIds.has(m.id)).reverse();

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
      
      const emailDate = new Date(parseInt(details.data.internalDate));

      await TransactionPipelineService.processEmail({
        userId,
        msgId: msg.id,
        emailDate,
        subject,
        snippet,
        fullBody,
        headers: details.data.payload.headers,
        autoSave,
        detected
      });
    }

    return { skipped: false, detected };
  }

  static async handleScanError(userId, error) {
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

      if (errString.includes("no refresh token") || errString.includes("invalid_grant")) {
        if (userId) {
           try {
             await gmailSyncRepository.updateById(userId, { googleTokens: null, gmailConnected: false });
           } catch (dbErr) {
             console.error(`[Gmail Scan] Failed to clear googleTokens for user ${userId}:`, dbErr);
           }
        }
        throw new Error("Google authentication expired. Please re-authenticate.");
      }
      throw new Error("Failed to scan Gmail");
  }
}

module.exports = GmailSyncService;
