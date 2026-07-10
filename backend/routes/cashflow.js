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

router.delete('/income-sources/:id', async (req, res) => {
  try {
    const result = await IncomeSource.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ success: false, error: 'Income source not found' });
    res.json({ success: true, message: 'Income source deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/income-sources/:id', async (req, res) => {
  try {
    const result = await IncomeSource.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!result) return res.status(404).json({ success: false, error: 'Income source not found' });
    res.json({ success: true, incomeSource: result });
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
    const IncomeCycle = require('../models/IncomeCycle');
    
    let totalIncome = 0;
    let totalAllocations = 0;
    
    for (let src of incomeSources) {
       const cycleId = IncomeCycle.getCycleIdentifier(src.frequency, new Date());
       const confirmedCycle = await IncomeCycle.findOne({
           incomeSourceId: src._id,
           cycleIdentifier: cycleId,
           status: 'processed'
       });
       
       let incomeForSource = src.amount;
       if (confirmedCycle) {
           incomeForSource = confirmedCycle.actualAmount;
       }
       totalIncome += incomeForSource;
       
       // Allocations
       const allocations = await GoalAllocation.find({ incomeSourceId: src._id, status: 'active' });
       for (let alloc of allocations) {
           if (alloc.allocationType === 'fixed') {
               totalAllocations += alloc.amountOrPercentage;
           } else {
               totalAllocations += (incomeForSource * alloc.amountOrPercentage) / 100;
           }
       }
    }

    const budgets = await CategoryBudget.find({ userId });
    let budgetReservations = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);

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
  const { userId, transactionId, incomeSourceId, choice } = req.body; // choice: 'use_transaction', 'use_expected', 'ignore', or undefined
  
  try {
    const txn = await Transaction.findById(transactionId);
    const source = await IncomeSource.findById(incomeSourceId);

    if (!txn || !source) return res.status(404).json({ error: "Transaction or Income Source not found" });

    const IncomeCycle = require('../models/IncomeCycle');
    const cycleId = IncomeCycle.getCycleIdentifier(source.frequency, txn.date || new Date());

    // Validation: Ensure this cycle wasn't already processed
    const existingCycle = await IncomeCycle.findOne({ 
       incomeSourceId: source._id, 
       cycleIdentifier: cycleId, 
       status: 'processed' 
    });

    if (existingCycle) {
       return res.status(400).json({ success: false, error: "An income has already been confirmed for this cycle." });
    }

    if (choice === 'ignore') {
       // Mark notification as read and treat as regular credit
       const Notification = require('../models/Notification');
       await Notification.updateMany(
          { transactionId: txn._id, type: { $in: ['income_verification', 'income_detected'] } },
          { $set: { read: true } }
       );
       return res.json({ success: true, message: "Transaction ignored as regular credit." });
    }

    let actualAmount = txn.amount;
    if (choice === 'use_expected') {
       actualAmount = source.amount;
    }

    // Calculate total allocations
    const allocations = await GoalAllocation.find({ incomeSourceId, status: 'active' });
    let totalAllocations = 0;
    
    for (let alloc of allocations) {
      const amountToAdd = alloc.allocationType === 'fixed' ? alloc.amountOrPercentage : (actualAmount * alloc.amountOrPercentage) / 100;
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
      cycleIdentifier: cycleId,
      cycleDate: txn.date || new Date(),
      actualAmount: actualAmount,
      expectedAmount: source.amount,
      goalAllocations: totalAllocations,
      budgetReservations: budgetReservations,
      totalExpenses: 0, // at cycle start
      status: 'processed'
    });

    await cycle.save();

    // Update the IncomeSource's lastReceivedDate if the transaction is newer
    if (!source.lastReceivedDate || new Date(txn.date) > new Date(source.lastReceivedDate)) {
      source.lastReceivedDate = txn.date;
      await source.save();
    }
    
    const Notification = require('../models/Notification');
    await Notification.updateMany(
       { transactionId: txn._id, type: { $in: ['income_verification', 'income_detected'] } },
       { $set: { read: true } }
    );

    res.json({ success: true, cycle });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
