const transactionService = require('../services/TransactionService');

class TransactionController {
  static async list(req, res) {
    try {
      const txns = await transactionService.list(req.query.userId);
      res.json(txns);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const newTxn = await transactionService.create(req.body);
      res.json({ success: true, transaction: newTxn });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      await transactionService.delete(req.params.id);
      res.json({ success: true, message: 'Transaction deleted' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = TransactionController;
