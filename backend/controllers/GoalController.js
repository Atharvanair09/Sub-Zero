const goalRepository = require('../repositories/GoalRepository');
const goalAllocationRepository = require('../repositories/GoalAllocationRepository');
const incomeRepository = require('../repositories/IncomeRepository');

class GoalController {
  static async list(req, res) {
    try {
      const goals = await goalRepository.findMany({ userId: req.query.userId });
      res.json(goals);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const goal = await goalRepository.create(req.body);
      res.json({ success: true, goal });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async listAllocations(req, res) {
    try {
      const allocations = await goalAllocationRepository.findMany({ userId: req.query.userId }, { populate: 'goalId' });
      res.json(allocations);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async createAllocation(req, res) {
    const { userId, incomeSourceId, goalId, allocationType, amountOrPercentage } = req.body;
    try {
      const incomeSource = await incomeRepository.findById(incomeSourceId);
      if (!incomeSource) return res.status(404).json({ error: "Income source not found" });

      // Validate allocation limit
      const existingAllocations = await goalAllocationRepository.findMany({ incomeSourceId, status: 'active' });
      
      let totalAllocatedAmount = 0;
      for (let alloc of existingAllocations) {
        if (alloc.allocationType === 'fixed') {
          totalAllocatedAmount += alloc.amountOrPercentage;
        } else {
          totalAllocatedAmount += (incomeSource.amount * alloc.amountOrPercentage) / 100;
        }
      }

      let newAllocAmount = 0;
      if (allocationType === 'fixed') {
        newAllocAmount = amountOrPercentage;
      } else {
        newAllocAmount = (incomeSource.amount * amountOrPercentage) / 100;
      }

      if (totalAllocatedAmount + newAllocAmount > incomeSource.amount) {
        return res.status(400).json({ 
          success: false, 
          error: "Allocation exceeds total income amount. Please reduce your allocation." 
        });
      }

      const allocation = await goalAllocationRepository.create(req.body);
      res.json({ success: true, allocation });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = GoalController;
