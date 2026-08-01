const incomeRepository = require('../repositories/IncomeRepository');

class IncomeController {
  static async list(req, res) {
    try {
      const sources = await incomeRepository.findMany({ userId: req.query.userId });
      res.json(sources);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const newSource = await incomeRepository.create(req.body);
      res.json({ success: true, incomeSource: newSource });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const result = await incomeRepository.findByIdAndDelete(req.params.id);
      if (!result) return res.status(404).json({ success: false, error: 'Income source not found' });
      res.json({ success: true, message: 'Income source deleted' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const result = await incomeRepository.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!result) return res.status(404).json({ success: false, error: 'Income source not found' });
      res.json({ success: true, incomeSource: result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = IncomeController;
