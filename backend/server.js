require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const User = require("./models/User");

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("FATAL ERROR: MONGODB_URI is not defined in .env");
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log("✅ Checkpoint: Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ Checkpoint: Could not connect to MongoDB Atlas", err));

// Mock Data
let mockSubscriptions = [
  {
    id: 1,
    name: 'Netflix',
    logo: 'https://www.cdnlogo.com/logos/n/11/netflix.svg',
    price: 19.99,
    plan: 'PREMIUM 4K',
    nextBill: 'Oct 24',
    status: 'Active Status',
    lastActivity: '2 days ago',
    alert: null,
    color: '#E50914',
    usedRecently: true
  },
  {
    id: 2,
    name: 'Adobe CC',
    logo: 'https://www.cdnlogo.com/logos/a/82/adobe-creative-cloud.svg',
    price: 54.99,
    plan: 'UNUSED',
    nextBill: 'Oct 21',
    status: 'Idle - Alert',
    lastActivity: 'No activity in last 28 days',
    alert: 'UNUSED WARNING',
    potentialSavings: '$650/year',
    color: '#FA0F00',
    usedRecently: false
  },
  {
    id: 3,
    name: 'Spotify',
    logo: 'https://www.cdnlogo.com/logos/s/17/spotify.svg',
    price: 16.99,
    plan: 'FAMILY PLAN',
    nextBill: 'Nov 02',
    status: 'Active Status',
    lastActivity: 'Today via "Alex\'s iPhone"',
    alert: null,
    color: '#1DB954',
    usedRecently: true
  },
  {
    id: 4,
    name: 'Dropbox',
    logo: 'https://www.cdnlogo.com/logos/d/15/dropbox.svg',
    price: 11.99,
    plan: 'PLUS 2TB',
    nextBill: 'Oct 30',
    status: 'Active Status',
    lastActivity: '6 days ago',
    alert: null,
    color: '#0061FF',
    usedRecently: true
  }
];

// Routes
app.post("/api/subscriptions", (req, res) => {
  const { name, price, plan, logo, color } = req.body;
  console.log(`POST /api/subscriptions - Adding new subscription: ${name}`);
  
  const newSub = {
    id: mockSubscriptions.length + 1,
    name,
    price: parseFloat(price),
    plan: plan || 'BASIC',
    logo: logo || 'https://www.cdnlogo.com/logos/z/19/zapier.svg',
    nextBill: 'Next Month',
    status: 'Active Status',
    lastActivity: 'Just added',
    alert: null,
    color: color || '#6366f1',
    usedRecently: true
  };
  
  mockSubscriptions.push(newSub);
  res.json({ success: true, subscription: newSub });
});

app.get("/api/subscriptions", (req, res) => {
  console.log("GET /api/subscriptions - Returning mock data");
  res.json(mockSubscriptions);
});

app.post("/api/subscriptions/usage", (req, res) => {
  const { id, usedRecently } = req.body;
  console.log(`POST /api/subscriptions/usage - Updating id ${id} to ${usedRecently}`);
  
  mockSubscriptions = mockSubscriptions.map(sub => 
    sub.id === id ? { ...sub, usedRecently } : sub
  );
  
  res.json({ success: true, updatedSubscription: mockSubscriptions.find(sub => sub.id === id) });
});

app.post("/api/subscriptions/cancel", (req, res) => {
  const { id } = req.body;
  console.log(`POST /api/subscriptions/cancel - Cancelling id ${id}`);
  
  const subToCancel = mockSubscriptions.find(sub => sub.id === id);
  mockSubscriptions = mockSubscriptions.filter(sub => sub.id !== id);
  
  res.json({ success: true, cancelled: subToCancel });
});

app.post("/api/users/sync", async (req, res) => {
  const { clerkId, email, fullName, imageUrl } = req.body;
  
  console.log(`[Backend Checkpoint] Received sync request for user: ${clerkId}`);

  try {
    let user = await User.findOneAndUpdate(
      { clerkId },
      { 
        email, 
        fullName, 
        imageUrl, 
        lastLogin: new Date() 
      },
      { upsert: true, new: true }
    );

    console.log(`✅ [Backend Checkpoint] User ${user.email} saved/updated successfully`);
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(`❌ [Backend Checkpoint] Error saving user:`, error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("SubZero Backend API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 [Backend Checkpoint] Server running on port ${PORT}`));