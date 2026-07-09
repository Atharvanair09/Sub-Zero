const mongoose = require("mongoose");

const incomeSourceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  expectedSender: { type: String },
  amount: { type: Number, required: true },
  frequency: { type: String, enum: ['weekly', 'biweekly', 'monthly', 'yearly'], default: 'monthly' },
  nextExpectedDate: { type: Date },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('IncomeSource', incomeSourceSchema);
