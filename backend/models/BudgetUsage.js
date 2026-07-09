const mongoose = require("mongoose");

const budgetUsageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true }, // e.g. 2026
  category: { type: String, required: true },
  totalSpent: { type: Number, default: 0 },
  alertsTriggered: { type: [Number], default: [] }, // which thresholds were triggered
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Compound index to ensure one usage record per category per month per user
budgetUsageSchema.index({ userId: 1, month: 1, year: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('BudgetUsage', budgetUsageSchema);
