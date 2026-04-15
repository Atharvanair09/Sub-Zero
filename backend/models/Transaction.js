const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Completed', 'Failed', 'Pending'],
    default: 'Completed'
  },
  method: {
    type: String,
    default: 'Detected Alert'
  },
  externalId: {
    type: String,
    index: true
  },
  logo: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
