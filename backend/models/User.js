const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  fullName: { type: String },
  imageUrl: { type: String },
  lastLogin: { type: Date, default: Date.now },
  preferences: {
    monthlyBudget: { type: Number, default: 0 },
    categoryBudgets: {
       food: { type: Number, default: 2000 },
       shopping: { type: Number, default: 3000 },
       transport: { type: Number, default: 1000 }
    },
    notificationsEnabled: { type: Boolean, default: true },
    onboarded: { type: Boolean, default: false }
  },
  googleTokens: { type: Object, default: null }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
