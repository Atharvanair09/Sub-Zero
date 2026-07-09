const mongoose = require("mongoose");

const incomeCycleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  incomeSourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'IncomeSource', required: true },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }, // if linked to a detected transaction
  cycleIdentifier: { type: String, required: true },
  cycleDate: { type: Date, required: true },
  actualAmount: { type: Number, required: true },
  expectedAmount: { type: Number, required: true },
  goalAllocations: { type: Number, default: 0 },
  budgetReservations: { type: Number, default: 0 },
  totalExpenses: { type: Number, default: 0 },
  status: { type: String, enum: ['processed', 'pending_resolution'], default: 'processed' },
  createdAt: { type: Date, default: Date.now }
});

incomeCycleSchema.statics.getCycleIdentifier = function(frequency, dateInput) {
  const date = new Date(dateInput);
  const year = date.getFullYear();
  if (frequency === 'monthly') {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  } else if (frequency === 'weekly') {
    const firstDay = new Date(year, 0, 1);
    const pastDaysOfYear = (date - firstDay) / 86400000;
    const weekNum = Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
    return `${year}-W${String(weekNum).padStart(2, '0')}`;
  } else if (frequency === 'biweekly') {
    const firstDay = new Date(year, 0, 1);
    const pastDaysOfYear = (date - firstDay) / 86400000;
    const weekNum = Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
    const biWeekNum = Math.ceil(weekNum / 2);
    return `${year}-BW${String(biWeekNum).padStart(2, '0')}`;
  } else if (frequency === 'yearly') {
    return `${year}`;
  }
  return `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`; // default
};

module.exports = mongoose.model('IncomeCycle', incomeCycleSchema);
