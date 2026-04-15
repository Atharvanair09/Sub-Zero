const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled'],
    default: 'active'
  },
  nextBillingDate: {
    type: Date,
    required: true
  },
  lastUsed: {
    type: Date,
    default: Date.now
  },
  logo: {
    type: String
  },
  plan: {
    type: String
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  usedRecently: {
    type: Boolean,
    default: true
  },
  usageLogs: {
    type: [Date],
    default: []
  },
  priceHistory: [{
    price: Number,
    date: { type: Date, default: Date.now }
  }],
  externalId: {
    type: String,
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
