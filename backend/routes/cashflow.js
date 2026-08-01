const express = require('express');
const router = express.Router();

const IncomeController = require('../controllers/IncomeController');
const GoalController = require('../controllers/GoalController');
const BudgetController = require('../controllers/BudgetController');
const CashFlowController = require('../controllers/CashFlowController');

// --- Income Sources ---
router.get('/income-sources', IncomeController.list);
router.post('/income-sources', IncomeController.create);
router.delete('/income-sources/:id', IncomeController.delete);
router.put('/income-sources/:id', IncomeController.update);

// --- Savings Goals ---
router.get('/savings-goals', GoalController.list);
router.post('/savings-goals', GoalController.create);

// --- Goal Allocations ---
router.get('/goal-allocations', GoalController.listAllocations);
router.post('/goal-allocations', GoalController.createAllocation);

// --- Category Budgets ---
router.get('/budgets', BudgetController.list);
router.post('/budgets', BudgetController.create);

// --- Cash Flow Summary & Dynamic Logic ---
router.get('/summary', CashFlowController.getSummary);

// API to manually trigger an income cycle for a transaction (called when user confirms)
router.post('/process-cycle', CashFlowController.processCycle);

module.exports = router;


module.exports = router;
