const transactionRepository = require('../repositories/TransactionRepository');

class TransactionService {
  static async list(userId) {
    return await transactionRepository.findMany({ userId }, { sort: { date: -1 } });
  }

  static async create(data) {
    return await transactionRepository.create(data);
  }

  static async delete(id) {
    return await transactionRepository.findByIdAndDelete(id);
  }
}

module.exports = TransactionService;
