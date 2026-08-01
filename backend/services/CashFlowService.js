const incomeRepository = require('../repositories/IncomeRepository');
const goalAllocationRepository = require('../repositories/GoalAllocationRepository');
const budgetRepository = require('../repositories/BudgetRepository');
const { getCycleIdentifier } = require('../utils/incomeCycleUtils');
const incomeCycleRepository = require('../repositories/IncomeCycleRepository');
const transactionRepository = require('../repositories/TransactionRepository');
const goalRepository = require('../repositories/GoalRepository');
const notificationRepository = require('../repositories/NotificationRepository');

class CashFlowService {
  static async getSummary(userId) {
    const incomeSources = await incomeRepository.findMany({ userId, status: 'active' });

    let totalIncome = 0;
    let totalAllocations = 0;
    
    for (let src of incomeSources) {
       const cycleId = getCycleIdentifier(src.frequency, new Date());
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
       
       // Allocations
       const allocations = await goalAllocationRepository.findMany({ incomeSourceId: src._id, status: 'active' });
       for (let alloc of allocations) {
           if (alloc.allocationType === 'fixed') {
               totalAllocations += alloc.amountOrPercentage;
           } else {
               totalAllocations += (incomeForSource * alloc.amountOrPercentage) / 100;
           }
       }
    }

    const budgets = await budgetRepository.findMany({ userId });
    let budgetReservations = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);

    // Get current month expenses
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const txns = await transactionRepository.findMany({ 
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

    const cycleId = getCycleIdentifier(source.frequency, txn.date || new Date());
    console.log(`[Cashflow API] /process-cycle - Triggered for source ${source.name}, transaction ${txn._id}. CycleId: ${cycleId}`);

    // Validation: Ensure this cycle wasn't already processed
    const existingCycle = await incomeCycleRepository.findOne({ 
       incomeSourceId: source._id, 
       cycleIdentifier: cycleId, 
       status: 'processed' 
    });

    if (existingCycle) {
       throw new Error("An income has already been confirmed for this cycle.");
    }

    if (choice === 'ignore') {
       // Mark notification as read and treat as regular credit
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

    // Calculate total allocations
    const allocations = await goalAllocationRepository.findMany({ incomeSourceId, status: 'active' });
    let totalAllocations = 0;
    
    for (let alloc of allocations) {
      const amountToAdd = alloc.allocationType === 'fixed' ? alloc.amountOrPercentage : (actualAmount * alloc.amountOrPercentage) / 100;
      totalAllocations += amountToAdd;
      
      // Update actual goal balance
      await goalRepository.findByIdAndUpdate(alloc.goalId, {
        $inc: { currentAmount: amountToAdd }
      });
    }

    // Get budget reservations
    const budgets = await budgetRepository.findMany({ userId });
    let budgetReservations = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);

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
      totalExpenses: 0, // at cycle start
      status: 'processed'
    });
    console.log(`[Cashflow API] /process-cycle - Created and saved IncomeCycle ${cycleId} with actual amount ₹${actualAmount}`);

    // Update the IncomeSource's lastReceivedDate if the transaction is newer
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
