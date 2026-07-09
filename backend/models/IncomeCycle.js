const mongoose = require("mongoose");

const incomeCycleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  incomeSourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'IncomeSource', required: true },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }, // if linked to a detected transaction
  cycleDate: { type: Date, required: true },
  totalIncome: { type: Number, required: true },
  goalAllocations: { type: Number, default: 0 },
  budgetReservations: { type: Number, default: 0 },
  totalExpenses: { type: Number, default: 0 },
  status: { type: String, enum: ['processed', 'pending_resolution'], default: 'processed' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('IncomeCycle', incomeCycleSchema);
