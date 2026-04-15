require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { google } = require("googleapis");

const app = express();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID.trim(),
  process.env.GOOGLE_CLIENT_SECRET.trim(),
  process.env.GOOGLE_REDIRECT_URI.trim()
);

let userTokens = null; // Memory storage for hackathon

app.use(cors());
app.use(express.json());

const User = require("./models/User");
const Subscription = require("./models/Subscription");

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("FATAL ERROR: MONGODB_URI is not defined in .env");
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log("✅ Checkpoint: Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ Checkpoint: Could not connect to MongoDB Atlas", err));

// Routes
app.post("/api/subscriptions", async (req, res) => {
  const { userId, name, price, plan, logo, color, category, billingCycle } = req.body;
  
  try {
    const newSub = new Subscription({
      userId,
      name,
      price: parseFloat(price),
      plan: plan || 'BASIC',
      logo: logo || 'https://www.cdnlogo.com/logos/z/19/zapier.svg',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
      status: 'active',
      color: color || '#6366f1',
      category: category || 'General',
      billingCycle: billingCycle || 'monthly'
    });
    
    await newSub.save();
    res.json({ success: true, subscription: newSub });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/subscriptions", async (req, res) => {
  const { userId } = req.query;
  try {
    const subscriptions = await Subscription.find(userId ? { userId } : {});
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/subscriptions/usage", async (req, res) => {
  const { id, usedRecently } = req.body;
  try {
    const update = { usedRecently, lastUsed: new Date() };
    if (usedRecently) {
      update.$push = { usageLogs: new Date() };
    }
    const sub = await Subscription.findByIdAndUpdate(id, update, { new: true });
    res.json({ success: true, updatedSubscription: sub });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/subscriptions/cancel", async (req, res) => {
  const { id } = req.body;
  try {
    const sub = await Subscription.findByIdAndDelete(id);
    res.json({ success: true, cancelled: sub });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/dashboard/stats", async (req, res) => {
  const { userId } = req.query;
  try {
    const subs = await Subscription.find({ userId });
    
    const monthlySpend = subs.reduce((sum, s) => sum + (s.billingCycle === 'monthly' ? s.price : s.price / 12), 0);
    const yearlyProjection = monthlySpend * 12;
    
    const categoryData = subs.reduce((acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + s.price;
      return acc;
    }, {});

    const pieChart = Object.keys(categoryData).map(cat => ({
      name: cat,
      value: categoryData[cat]
    }));

    res.json({
      monthlySpend,
      yearlyProjection,
      pieChart,
      totalSubs: subs.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/recommendations", async (req, res) => {
  const { userId } = req.query;
  try {
    const subs = await Subscription.find({ userId });
    const recommendations = [];

    subs.forEach(sub => {
      const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
      
      // Calculate usage score: days_used / billing_cycle_days
      const cycleDays = sub.billingCycle === 'monthly' ? 30 : 365;
      
      // Get unique days used in the last cycle
      const uniqueDaysUsed = new Set(
        sub.usageLogs
          .filter(log => log > new Date(Date.now() - cycleDays * 24 * 60 * 60 * 1000))
          .map(log => log.toISOString().split('T')[0])
      ).size;
      
      const usageScore = uniqueDaysUsed / cycleDays;

      if (!sub.usedRecently || sub.lastUsed < fifteenDaysAgo || usageScore < 0.1) {
        recommendations.push({
          type: 'cancel',
          subscriptionId: sub._id,
          name: sub.name,
          message: `Your usage score is low (${(usageScore * 100).toFixed(1)}%). Consider cancelling ${sub.name} to save ₹${sub.price}/month.`,
          priority: sub.price > 500 ? 'high' : 'medium'
        });
      } else if (sub.price > 1000 && usageScore < 0.3) {
        recommendations.push({
          type: 'downgrade',
          subscriptionId: sub._id,
          name: sub.name,
          message: `${sub.name} plan is high-cost relative to your usage. Downgrade to save more.`,
          priority: 'high'
        });
      }
    });

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
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

app.patch("/api/users/preferences", async (req, res) => {
  const { userId, preferences } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      { $set: { preferences } },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Google Gmail API Routes ---

app.get("/api/auth/google/url", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/gmail.readonly"],
    redirect_uri: process.env.GOOGLE_REDIRECT_URI.trim() 
  });
  console.log("Generated Auth URL:", url);
  res.json({ url });
});

app.get("/api/auth/google/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    userTokens = tokens;
    // Redirect back to frontend
    res.redirect("http://localhost:5173/?scan=true");
  } catch (error) {
    console.error("Error exchanging code for tokens", error);
    res.status(500).send("Authentication failed");
  }
});

app.get("/api/gmail/scan", async (req, res) => {
  if (!userTokens) {
    return res.status(401).json({ error: "Not authenticated with Google" });
  }

  oauth2Client.setCredentials(userTokens);
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  try {
    const response = await gmail.users.messages.list({
      userId: "me",
      q: "subject:(receipt OR paid OR subscription OR bill OR invoice OR transaction OR order OR purchase OR renewed OR \"payment confirmed\")",
      maxResults: 50,
    });

    const messages = response.data.messages || [];
    const detected = [];

    console.log(`[Gmail Scan] Found ${messages.length} potential emails to analyze.`);

    for (const msg of messages) {
      const details = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
      });

      const snippet = details.data.snippet.toLowerCase();
      const subject = details.data.payload.headers.find(h => h.name === 'Subject')?.value.toLowerCase() || "";
      const textToScan = subject + " " + snippet;

      // Expanded list of vendors
      const vendors = [
        { name: 'Netflix', domain: 'netflix.com', category: 'OTT' },
        { name: 'Spotify', domain: 'spotify.com', category: 'Music' },
        { name: 'Amazon Prime', domain: 'amazon.com', category: 'Shopping' },
        { name: 'YouTube', domain: 'youtube.com', category: 'OTT' },
        { name: 'Disney', domain: 'disneyplus.com', category: 'OTT' },
        { name: 'LinkedIn', domain: 'linkedin.com', category: 'Work' },
        { name: 'Adobe', domain: 'adobe.com', category: 'Work' },
        { name: 'Canva', domain: 'canva.com', category: 'Design' },
        { name: 'ChatGPT', domain: 'openai.com', category: 'AI' },
        { name: 'Apple', domain: 'apple.com', category: 'Tech' },
        { name: 'Google One', domain: 'google.com', category: 'Storage' },
        { name: 'Microsoft', domain: 'microsoft.com', category: 'Work' },
        { name: 'GitHub', domain: 'github.com', category: 'Work' }
      ];

      for (const vendor of vendors) {
        if (textToScan.includes(vendor.name.toLowerCase())) {
          // Extract price (improved regex)
          const priceMatch = textToScan.match(/(?:₹|\$|rs\.?|usd)\s?(\d+(?:[.,]\d{2})?)/i);
          const price = priceMatch ? priceMatch[1] : "199";

          if (!detected.find(d => d.name === vendor.name)) {
            detected.push({
              name: vendor.name,
              price: price.replace(',', ''), // Clean up for number parsing
              plan: 'Monthly',
              category: vendor.category,
              logo: `https://www.google.com/s2/favicons?sz=128&domain=${vendor.domain}`,
              detectedFrom: details.data.payload.headers.find(h => h.name === 'Subject')?.value || "Subscription Receipt"
            });
          }
        }
      }
    }

    res.json({ success: true, detected });
  } catch (error) {
    console.error("Gmail scan error", error);
    res.status(500).json({ error: "Failed to scan Gmail" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 [Backend Checkpoint] Server running on port ${PORT}`));