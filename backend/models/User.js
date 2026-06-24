const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  // Email is the canonical, platform-agnostic unique key
  email: { type: String, required: true, unique: true },

  fullName: { type: String },
  imageUrl: { type: String },
  lastLogin: { type: Date, default: Date.now },

  // Provider IDs — one account can be linked from multiple platforms
  providerIds: {
    clerk:  { type: String, default: null }, // Web (Clerk) user ID
    google: { type: String, default: null }, // Mobile (Google Sign-In) subject ID
  },

  // Kept for backward-compatibility with existing queries that use { clerkId: userId }
  // This is now a virtual alias pointing to providerIds.clerk
  clerkId: { type: String, default: null },

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

  // Whether the user has explicitly connected their Google/Gmail account
  gmailConnected: { type: Boolean, default: false },

  // Structured Google OAuth tokens — null until the user completes Gmail OAuth
  googleTokens: {
    type: new mongoose.Schema({
      access_token:  { type: String, default: null },
      refresh_token: { type: String, default: null },
      expiry_date:   { type: Number, default: null },
      token_type:    { type: String, default: null },
      scope:         { type: String, default: null },
    }, { _id: false }),
    default: null,
  },
}, { timestamps: true });

// Index for fast provider-ID lookups
UserSchema.index({ "providerIds.clerk": 1 }, { sparse: true });
UserSchema.index({ "providerIds.google": 1 }, { sparse: true });

module.exports = mongoose.model("User", UserSchema);
