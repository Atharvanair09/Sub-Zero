const mongoose = require("mongoose");

const goalAllocationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'SavingsGoal', required: true },
  incomeSourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'IncomeSource', required: true },
  allocationType: { type: String, enum: ['percentage', 'fixed'], required: true },
  amountOrPercentage: { type: Number, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GoalAllocation', goalAllocationSchema);
