const gmailSyncService = require('../services/GmailSyncService');

class GmailController {
  static async getStatus(req, res) {
    try {
      const status = await gmailSyncService.getStatus(req.query.userId);
      res.json({ success: true, ...status });
    } catch (error) {
      if (error.message === "userId is required") {
         return res.status(400).json({ success: false, error: error.message });
      }
      if (error.message === "User not found") {
         return res.status(404).json({ success: false, error: error.message });
      }
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static getAuthUrl(req, res) {
    const url = gmailSyncService.getAuthUrl(req.query.userId);
    console.log("Generated Auth URL:", url);
    res.json({ url });
  }

  static async authCallback(req, res) {
    const { code, state, error, error_description } = req.query;
    console.log(`[Google OAuth Callback] Code received: ${code ? "YES" : "NO"}, State (UserId): ${state}`);
    
    if (error || error_description) {
      console.error(`[Google OAuth Callback] Google returned an OAuth error: ${error} - ${error_description}`);
    }

    if (!code) {
      console.error("[Google OAuth Callback] Error: No code received in query parameters. Query params:", req.query);
      return res.status(400).send(`Authentication failed: ${error_description || error || "Missing authorization code"}`);
    }

    try {
      await gmailSyncService.exchangeToken(code, state);
      
      const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").trim();
      const redirectUrl = `${frontendUrl}/?scan=true`;
      console.log(`[Google OAuth Callback] Redirecting user to: ${redirectUrl}`);
      res.redirect(redirectUrl);
    } catch (err) {
      console.error("[Google OAuth Callback] Error exchanging code for tokens:", err);
      res.status(500).send("Authentication failed");
    }
  }

  static async scan(req, res) {
    try {
      const result = await gmailSyncService.scan(req.query);
      
      if (result.skipped) {
        return res.status(200).json({ success: true, detected: [], skipped: true });
      }

      res.json({ success: true, detected: result.detected });
    } catch (error) {
      if (error.message === "User not found") {
        return res.status(404).json({ error: "User not found" });
      }

      try {
         await gmailSyncService.handleScanError(req.query.userId, error);
      } catch (handledError) {
         if (handledError.message === "Google authentication expired. Please re-authenticate.") {
            return res.status(401).json({ error: handledError.message });
         }
         return res.status(500).json({ error: handledError.message });
      }
    }
  }
}

module.exports = GmailController;
