const incomeRepository = require('../repositories/IncomeRepository');
const goalAllocationRepository = require('../repositories/GoalAllocationRepository');
const budgetRepository = require('../repositories/BudgetRepository');
const incomeCycleRepository = require('../repositories/IncomeCycleRepository');
const transactionRepository = require('../repositories/TransactionRepository');
const goalRepository = require('../repositories/GoalRepository');
const notificationRepository = require('../repositories/NotificationRepository');

const DateCycleEngine = require('../domain/engines/DateCycleEngine');
const IncomeCycleEngine = require('../domain/engines/IncomeCycleEngine');
const BudgetAllocationEngine = require('../domain/engines/BudgetAllocationEngine');
const CashFlowEngine = require('../domain/engines/CashFlowEngine');
const GoalAllocationEngine = require('../domain/engines/GoalAllocationEngine');

class CashFlowService {
  static async getSummary(userId) {
    const incomeSources = await incomeRepository.findMany({ userId, status: 'active' });

    let totalIncome = 0;
    let totalAllocations = 0;
    
    for (let src of incomeSources) {
       const cycleId = IncomeCycleEngine.getCycleId(src.frequency, new Date());
       const confirmedCycle = await incomeCycleRepository.findOne({
           incomeSourceId: src._id,
           cycleIdentifier: cycleId,
           status: 'processed'
       });
       
       let incomeForSource = src.amount;
       if (confirmedCycle) {
           incomeForSource = confirmedCycle.actualAmount;
           console.log(`[Cashflow API] /summary - Found confirmed cycle ${cycleId} for source ${src.name}. Actual Amount: ₹${incomeForSource}`);
       } else {
           console.log(`[Cashflow API] /summary - No confirmed cycle ${cycleId} for source ${src.name}. Using expected Amount: ₹${incomeForSource}`);
       }
       totalIncome += incomeForSource;
       
       const allocations = await goalAllocationRepository.findMany({ incomeSourceId: src._id, status: 'active' });
       totalAllocations += GoalAllocationEngine.calculateTotalAllocatedAmount(allocations, incomeForSource);
    }

    const budgets = await budgetRepository.findMany({ userId });
    let budgetReservations = BudgetAllocationEngine.calculateTotalReservations(budgets);

    const startOfMonth = DateCycleEngine.getStartOfMonth(new Date());
    const txns = await transactionRepository.findMany({ 
      userId, 
      type: 'debit', 
      date: { $gte: startOfMonth } 
    });
    
    const totalExpenses = CashFlowEngine.calculateTotalExpenses(txns);
    const budgetUtilization = BudgetAllocationEngine.calculateBudgetUtilization(budgets, txns);
    const remainingAvailableIncome = CashFlowEngine.calculateRemainingAvailableIncome(totalIncome, totalAllocations, budgetReservations, totalExpenses);

    return {
      totalIncome,
      totalAllocations,
      budgetReservations,
      totalExpenses,
      remainingAvailableIncome,
      budgetUtilization
    };
  }

  static async processCycle({ userId, transactionId, incomeSourceId, choice }) {
    const txn = await transactionRepository.findById(transactionId);
    const source = await incomeRepository.findById(incomeSourceId);

    if (!txn || !source) {
        throw new Error("Transaction or Income Source not found");
    }

    const cycleId = IncomeCycleEngine.getCycleId(source.frequency, txn.date || new Date());
    console.log(`[Cashflow API] /process-cycle - Triggered for source ${source.name}, transaction ${txn._id}. CycleId: ${cycleId}`);

    const existingCycle = await incomeCycleRepository.findOne({ 
       incomeSourceId: source._id, 
       cycleIdentifier: cycleId, 
       status: 'processed' 
    });

    if (existingCycle) {
       throw new Error("An income has already been confirmed for this cycle.");
    }

    if (choice === 'ignore') {
       await notificationRepository.updateMany(
          { transactionId: txn._id, type: { $in: ['income_verification', 'income_detected'] } },
          { $set: { read: true } }
       );
       return { ignored: true, message: "Transaction ignored as regular credit." };
    }

    let actualAmount = txn.amount;
    if (choice === 'use_expected') {
       actualAmount = source.amount;
    }

    const allocations = await goalAllocationRepository.findMany({ incomeSourceId, status: 'active' });
    const totalAllocations = GoalAllocationEngine.calculateTotalAllocatedAmount(allocations, actualAmount);
    
    for (let alloc of allocations) {
      const amountToAdd = GoalAllocationEngine.calculateAmountToAdd(alloc, actualAmount);
      await goalRepository.findByIdAndUpdate(alloc.goalId, {
        $inc: { currentAmount: amountToAdd }
      });
    }

    const budgets = await budgetRepository.findMany({ userId });
    const budgetReservations = BudgetAllocationEngine.calculateTotalReservations(budgets);

    const cycle = await incomeCycleRepository.create({
      userId,
      incomeSourceId,
      transactionId,
      cycleIdentifier: cycleId,
      cycleDate: txn.date || new Date(),
      actualAmount: actualAmount,
      expectedAmount: source.amount,
      goalAllocations: totalAllocations,
      budgetReservations: budgetReservations,
      totalExpenses: 0,
      status: 'processed'
    });
    console.log(`[Cashflow API] /process-cycle - Created and saved IncomeCycle ${cycleId} with actual amount ₹${actualAmount}`);

    if (!source.lastReceivedDate || new Date(txn.date) > new Date(source.lastReceivedDate)) {
      await incomeRepository.updateOne({ _id: source._id }, { $set: { lastReceivedDate: txn.date } });
    }
    
    await notificationRepository.updateMany(
       { transactionId: txn._id, type: { $in: ['income_verification', 'income_detected'] } },
       { $set: { read: true } }
    );

    return { ignored: false, cycle };
  }
}

module.exports = CashFlowService;
