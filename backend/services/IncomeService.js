const incomeRepository = require('../repositories/IncomeRepository');

class IncomeService {
  static async list(userId) {
    return await incomeRepository.findMany({ userId });
  }

  static async create(data) {
    return await incomeRepository.create(data);
  }

  static async delete(id) {
    const result = await incomeRepository.findByIdAndDelete(id);
    if (!result) {
      throw new Error('Income source not found');
    }
    return result;
  }

  static async update(id, data) {
    const result = await incomeRepository.findByIdAndUpdate(id, data, { new: true });
    if (!result) {
      throw new Error('Income source not found');
    }
    return result;
  }
}

module.exports = IncomeService;
