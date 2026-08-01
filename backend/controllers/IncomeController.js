const incomeService = require('../services/IncomeService');

class IncomeController {
  static async list(req, res) {
    try {
      const sources = await incomeService.list(req.query.userId);
      res.json(sources);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const newSource = await incomeService.create(req.body);
      res.json({ success: true, incomeSource: newSource });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      await incomeService.delete(req.params.id);
      res.json({ success: true, message: 'Income source deleted' });
    } catch (error) {
      if (error.message === 'Income source not found') {
         return res.status(404).json({ success: false, error: error.message });
      }
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const result = await incomeService.update(req.params.id, req.body);
      res.json({ success: true, incomeSource: result });
    } catch (error) {
      if (error.message === 'Income source not found') {
         return res.status(404).json({ success: false, error: error.message });
      }
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = IncomeController;
