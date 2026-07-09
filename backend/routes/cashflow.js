const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const IncomeSource = require('../models/IncomeSource');
const SavingsGoal = require('../models/SavingsGoal');
const GoalAllocation = require('../models/GoalAllocation');
const CategoryBudget = require('../models/CategoryBudget');
const IncomeCycle = require('../models/IncomeCycle');
const Transaction = require('../models/Transaction');

// --- Income Sources ---
router.get('/income-sources', async (req, res) => {
  try {
    const sources = await IncomeSource.find({ userId: req.query.userId });
    res.json(sources);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/income-sources', async (req, res) => {
  try {
    const newSource = new IncomeSource(req.body);
    await newSource.save();
    res.json({ success: true, incomeSource: newSource });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Savings Goals ---
router.get('/savings-goals', async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ userId: req.query.userId });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/savings-goals', async (req, res) => {
  try {
    const goal = new SavingsGoal(req.body);
    await goal.save();
    res.json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Goal Allocations ---
router.get('/goal-allocations', async (req, res) => {
  try {
    const allocations = await GoalAllocation.find({ userId: req.query.userId }).populate('goalId');
    res.json(allocations);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/goal-allocations', async (req, res) => {
  const { userId, incomeSourceId, goalId, allocationType, amountOrPercentage } = req.body;
  try {
    const incomeSource = await IncomeSource.findById(incomeSourceId);
    if (!incomeSource) return res.status(404).json({ error: "Income source not found" });

    // Validate allocation limit
    const existingAllocations = await GoalAllocation.find({ incomeSourceId, status: 'active' });
    
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

    const allocation = new GoalAllocation(req.body);
    await allocation.save();
    res.json({ success: true, allocation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Category Budgets ---
router.get('/budgets', async (req, res) => {
  try {
    const budgets = await CategoryBudget.find({ userId: req.query.userId });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/budgets', async (req, res) => {
  try {
    // Upsert budget for category
    const { userId, category, monthlyLimit, thresholds } = req.body;
    const budget = await CategoryBudget.findOneAndUpdate(
      { userId, category },
      { monthlyLimit, thresholds: thresholds || [80, 100], updatedAt: new Date() },
      { new: true, upsert: true }
    );
    res.json({ success: true, budget });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Cash Flow Summary & Dynamic Logic ---
router.get('/summary', async (req, res) => {
  const { userId } = req.query;
  try {
    const incomeSources = await IncomeSource.find({ userId, status: 'active' });
    let totalIncome = incomeSources.reduce((sum, src) => sum + src.amount, 0);

    const budgets = await CategoryBudget.find({ userId });
    let budgetReservations = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);

    const allocations = await GoalAllocation.find({ userId, status: 'active' }).populate('incomeSourceId');
    let totalAllocations = 0;
    for (let alloc of allocations) {
      if (!alloc.incomeSourceId) continue;
      if (alloc.allocationType === 'fixed') {
        totalAllocations += alloc.amountOrPercentage;
      } else {
        totalAllocations += (alloc.incomeSourceId.amount * alloc.amountOrPercentage) / 100;
      }
    }

    // Get current month expenses
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const txns = await Transaction.find({ 
      userId, 
      type: 'debit', 
      date: { $gte: startOfMonth } 
    });
    const totalExpenses = txns.reduce((sum, t) => sum + (t.amount || 0), 0);

    // Calculate budget utilization dynamically
    let budgetUtilization = [];
    for (let b of budgets) {
      const spent = txns.filter(t => t.category === b.category).reduce((s, t) => s + (t.amount || 0), 0);
      budgetUtilization.push({
        category: b.category,
        limit: b.monthlyLimit,
        spent: spent,
        percentage: (spent / b.monthlyLimit) * 100
      });
    }

    const remainingAvailableIncome = totalIncome - totalAllocations - budgetReservations - totalExpenses;

    res.json({
      success: true,
      totalIncome,
      totalAllocations,
      budgetReservations,
      totalExpenses,
      remainingAvailableIncome,
      budgetUtilization
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API to manually trigger an income cycle for a transaction (called when user confirms)
router.post('/process-cycle', async (req, res) => {
  const { userId, transactionId, incomeSourceId } = req.body;
  
  try {
    const txn = await Transaction.findById(transactionId);
    const source = await IncomeSource.findById(incomeSourceId);

    if (!txn || !source) return res.status(404).json({ error: "Transaction or Income Source not found" });

    // Calculate total allocations
    const allocations = await GoalAllocation.find({ incomeSourceId, status: 'active' });
    let totalAllocations = 0;
    
    for (let alloc of allocations) {
      const amountToAdd = alloc.allocationType === 'fixed' ? alloc.amountOrPercentage : (source.amount * alloc.amountOrPercentage) / 100;
      totalAllocations += amountToAdd;
      
      // Update actual goal balance
      await SavingsGoal.findByIdAndUpdate(alloc.goalId, {
        $inc: { currentAmount: amountToAdd }
      });
    }

    // Get budget reservations
    const budgets = await CategoryBudget.find({ userId });
    let budgetReservations = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);

    const cycle = new IncomeCycle({
      userId,
      incomeSourceId,
      transactionId,
      cycleDate: txn.date || new Date(),
      totalIncome: source.amount,
      goalAllocations: totalAllocations,
      budgetReservations: budgetReservations,
      totalExpenses: 0 // at cycle start
    });

    await cycle.save();
    res.json({ success: true, cycle });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
