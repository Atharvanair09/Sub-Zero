const express = require('express');
const router = express.Router();

const IncomeController = require('../controllers/IncomeController');
const GoalController = require('../controllers/GoalController');
const BudgetController = require('../controllers/BudgetController');
const CashFlowController = require('../controllers/CashFlowController');

const validateRequest = require('../middlewares/validateRequest');
const { schemas } = require('../schemas/index');

// --- Income Sources ---
router.get('/income-sources', validateRequest(schemas.IncomeList), IncomeController.list);
router.post('/income-sources', validateRequest(schemas.IncomeCreate), IncomeController.create);
router.delete('/income-sources/:id', validateRequest(schemas.IncomeDelete), IncomeController.delete);
router.put('/income-sources/:id', validateRequest(schemas.IncomeUpdate), IncomeController.update);

// --- Savings Goals ---
router.get('/savings-goals', validateRequest(schemas.GoalList), GoalController.list);
router.post('/savings-goals', validateRequest(schemas.GoalCreate), GoalController.create);

// --- Goal Allocations ---
router.get('/goal-allocations', validateRequest(schemas.GoalAllocationList), GoalController.listAllocations);
router.post('/goal-allocations', validateRequest(schemas.GoalAllocationCreate), GoalController.createAllocation);

// --- Category Budgets ---
router.get('/budgets', validateRequest(schemas.BudgetList), BudgetController.list);
router.post('/budgets', validateRequest(schemas.BudgetCreate), BudgetController.create);

// --- Cash Flow Summary & Dynamic Logic ---
router.get('/summary', validateRequest(schemas.CashFlowSummary), CashFlowController.getSummary);

// API to manually trigger an income cycle for a transaction (called when user confirms)
router.post('/process-cycle', validateRequest(schemas.CashFlowProcess), CashFlowController.processCycle);

module.exports = router;


module.exports = router;
