const mongoose = require("mongoose");

const categoryBudgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { 
    type: String, 
    required: true,
    enum: [
      'Food & Dining', 'Shopping', 'Transport', 'Entertainment', 
      'Bills & Utilities', 'Healthcare', 'Travel', 'Investments', 
      'Subscriptions', 'Others'
    ]
  },
  monthlyLimit: { type: Number, required: true },
  thresholds: { type: [Number], default: [80, 100] }, // percentage thresholds for alerts
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CategoryBudget', categoryBudgetSchema);
