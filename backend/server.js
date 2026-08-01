require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { google } = require("googleapis");
const { parseEmail } = require("./src/parser/engine");

const app = express();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID.trim(),
  process.env.GOOGLE_CLIENT_SECRET.trim(),
  process.env.GOOGLE_REDIRECT_URI.trim()
);

let userTokens = null; // Memory storage for hackathon

app.use(cors());
app.use(express.json());

const userRepository = require('./repositories/UserRepository');
const gmailSyncRepository = require('./repositories/GmailSyncRepository');
const transactionRepository = require('./repositories/TransactionRepository');
const notificationRepository = require('./repositories/NotificationRepository');
const subscriptionRepository = require('./repositories/SubscriptionRepository');

// Plan Alternatives Database (Phase 2: Plan Optimization)
const PLAN_ALTERNATIVES = {
  'Netflix': [
    { name: 'Mobile Plan', price: 149, reason: 'You mostly watch on your phone.' },
    { name: 'Basic Plan', price: 199, reason: 'Downgrade from Premium to save ₹300.' }
  ],
  'Spotify': [
    { name: 'Family Plan', price: 179, reason: 'Detected multiple users. Group up to save.' },
    { name: 'Student Discount', price: 59, reason: 'Check if you are eligible for student rates.' }
  ],
  'Adobe': [
    { name: 'Photography Plan', price: 797, reason: 'You only use Photoshop & Lightroom.' },
    { name: 'Canva Pro', price: 499, alternative: true, reason: 'Cheaper alternative for basic design.' }
  ]
};

// ... existing connection logic ...
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("FATAL ERROR: MONGODB_URI is not defined in .env");
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log("✅ Checkpoint: Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ Checkpoint: Could not connect to MongoDB Atlas", err));

// Controllers
const SubscriptionController = require('./controllers/SubscriptionController');
const TransactionController = require('./controllers/TransactionController');
const DashboardController = require('./controllers/DashboardController');
const InsightController = require('./controllers/InsightController');
const UserController = require('./controllers/UserController');
const NotificationController = require('./controllers/NotificationController');
const GmailController = require('./controllers/GmailController');
const ChatController = require('./controllers/ChatController');

// Routes
app.use('/api/cashflow', require('./routes/cashflow'));

app.post("/api/subscriptions", SubscriptionController.create);
app.get("/api/subscriptions", SubscriptionController.list);
app.post("/api/subscriptions/usage", SubscriptionController.logUsage);
app.post("/api/subscriptions/cancel", SubscriptionController.cancel);

app.get("/api/transactions", TransactionController.list);

app.get("/api/dashboard/stats", DashboardController.getStats);
app.get("/api/recommendations", InsightController.getRecommendations);

app.post("/api/users/sync", UserController.sync);
app.patch("/api/users/preferences", UserController.updatePreferences);
app.get("/api/users/gmail-status", GmailController.getStatus);

app.get("/api/notifications", NotificationController.list);
app.post("/api/notifications/read", NotificationController.markRead);

app.get("/api/auth/google/url", GmailController.getAuthUrl);
app.get("/api/auth/google/callback", GmailController.authCallback);
app.get("/api/gmail/scan", GmailController.scan);

app.get("/api/insights/patterns", InsightController.getPatterns);
app.post("/api/chat", ChatController.chat);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 [Backend Checkpoint] Server running on port ${PORT}`));