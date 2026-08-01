const chatService = require('../services/ChatService');

class ChatController {
  static async chat(req, res) {
    try {
      const reply = await chatService.getChatReply(req.body);
      res.json({ reply });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = ChatController;
