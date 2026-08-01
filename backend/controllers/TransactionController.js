const transactionRepository = require('../repositories/TransactionRepository');

class TransactionController {
  static async list(req, res) {
    const { userId } = req.query;
    try {
      const transactions = await transactionRepository.findMany(userId ? { userId } : {}, { sort: { date: -1 } });
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = TransactionController;
