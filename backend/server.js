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

const User = require("./models/User");
const Subscription = require("./models/Subscription");
const Notification = require("./models/Notification");
const Transaction = require("./models/Transaction");

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

// Routes
app.post("/api/subscriptions", async (req, res) => {
  const { userId, name, price, plan, logo, color, category, billingCycle, nextBillingDate, externalId, type } = req.body;
  
  try {
    const isTransaction = ['Food', 'Travel', 'Bank Transaction', 'Shopping'].includes(category) || 
                          /zomato|swiggy|uber|ola|blinkit|zepto|amazon (?!prime)/i.test(name);
    const parsedPrice = parseFloat(price);

    if (isTransaction) {
       const newTxn = new Transaction({
         userId,
         name,
         amount: parsedPrice,
         category: category || 'Bank Transaction',
         logo: logo || `https://www.google.com/s2/favicons?sz=128&domain=${name.toLowerCase().replace(/\s/g, '')}.com`,
         externalId,
         type: type || 'debit'
       });
       await newTxn.save();
       return res.json({ success: true, transaction: newTxn });
    }

    const newSub = new Subscription({
      userId,
      name,
      price: parsedPrice,
      plan: plan || 'BASIC',
      logo: logo || 'https://www.cdnlogo.com/logos/z/19/zapier.svg',
      nextBillingDate: nextBillingDate ? new Date(nextBillingDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'active',
      color: color || '#6366f1',
      category: category || 'General',
      billingCycle: billingCycle || 'monthly',
      externalId // Save the reference to prevent duplicates
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
    const subsWithHealth = subscriptions.map(s => {
        const cycleDays = s.billingCycle === 'monthly' ? 30 : 365;
        const uniqueDaysUsed = new Set(s.usageLogs.map(log => new Date(log).toISOString().split('T')[0])).size;
        let itemScore = (uniqueDaysUsed / cycleDays) * 100;
        if (!s.usedRecently) itemScore -= 30;
        if (s.price < 500 && uniqueDaysUsed > 5) itemScore += 20;
        itemScore = Math.min(Math.max(0, itemScore), 100);
        if(uniqueDaysUsed === 0 && s.usedRecently) itemScore = 85; 

        return {
          ...s.toObject(),
          healthScore: Math.round(itemScore)
        };
    });
    res.json(subsWithHealth);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/transactions", async (req, res) => {
  const { userId } = req.query;
  try {
    const transactions = await Transaction.find(userId ? { userId } : {}).sort({ date: -1 });
    res.json(transactions);
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
    const user = await User.findById(userId);
    
    // Get recent transactions to accurately calculate monthly spend
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const txns = await Transaction.find({ userId, date: { $gte: thirtyDaysAgo } });
    
    const subSpend = subs.reduce((sum, s) => sum + (s.billingCycle === 'monthly' ? s.price : s.price / 12), 0);
    const txnSpend = txns.reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const monthlySpend = subSpend + txnSpend;
    const yearlyProjection = (subSpend * 12) + (txnSpend * 12);
    
    // Financial Intelligence
    const foodSpend = txns.filter(t => ['Food', 'Zomato', 'Swiggy', 'Blinkit', 'Zepto'].includes(t.category) || /zomato|swiggy|uber eats|blinkit|zepto/i.test(t.name)).reduce((sum, t) => sum + (t.amount || 0), 0);
    const shoppingSpend = txns.filter(t => ['Shopping', 'Amazon', 'Flipkart'].includes(t.category) || /amazon|flipkart|myntra/i.test(t.name)).reduce((sum, t) => sum + (t.amount || 0), 0);
    const transportSpend = txns.filter(t => ['Transport', 'Uber', 'Ola', 'Rapido'].includes(t.category) || /uber|ola|rapido/i.test(t.name)).reduce((sum, t) => sum + (t.amount || 0), 0);
    const subPercent = monthlySpend > 0 ? (subSpend / monthlySpend) * 100 : 0;
    
    let healthScore = 0;
    if(subs.length > 0) {
      let totalScore = 0;
      subs.forEach(s => {
        const cycleDays = s.billingCycle === 'monthly' ? 30 : 365;
        const uniqueDaysUsed = new Set(s.usageLogs.map(log => new Date(log).toISOString().split('T')[0])).size;
        let itemScore = (uniqueDaysUsed / cycleDays) * 100;
        if (!s.usedRecently) itemScore -= 30; // penalty
        if (s.price < 500 && uniqueDaysUsed > 5) itemScore += 20;
        itemScore = Math.min(Math.max(0, itemScore), 100);
        if(uniqueDaysUsed === 0 && s.usedRecently) itemScore = 85;
        totalScore += itemScore;
      });
      healthScore = Math.round(totalScore / subs.length);
    } else {
      healthScore = 100;
    }

    const categoryData = subs.reduce((acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + s.price;
      return acc;
    }, {});

    // Add transaction categories
    txns.forEach(t => {
      let cat = t.category || 'Transaction';
      if(/zomato|swiggy|uber eats/i.test(t.name)) cat = "Food";
      categoryData[cat] = (categoryData[cat] || 0) + t.amount;
    });

    const pieChart = Object.keys(categoryData).map(cat => ({
      name: cat,
      value: categoryData[cat]
    }));

    // Dynamic Recent Activity (Syncing notifications + transactions)
    const recentTxns = await Transaction.find({ userId }).sort({ date: -1 }).limit(5);
    const recentNotifs = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(3);
    
    const recentActivity = [
      ...recentTxns.map(t => ({
        id: t._id,
        type: 'transaction',
        name: t.name,
        price: t.amount,
        message: 'Payment confirmed',
        date: t.date || t.createdAt,
        category: t.category,
        logo: t.logo
      })),
      ...recentNotifs.map(n => ({
        id: n._id,
        type: 'notification',
        name: n.title,
        price: n.priority === 'high' ? 'ALERT' : 'AI INFO',
        message: n.message,
        date: n.createdAt,
        subType: n.type,
        logo: 'https://cdn-icons-png.flaticon.com/512/10433/10433048.png' // Default AI logo
      }))
    ].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    res.json({
      monthlySpend,
      yearlyProjection,
      pieChart,
      totalSubs: subs.length,
      totalTxns: txns.length,
      foodSpend,
      shoppingSpend,
      transportSpend,
      subPercent,
      healthScore,
      monthlyBudget: user?.preferences?.monthlyBudget || 0,
      categoryBudgets: user?.preferences?.categoryBudgets || { food: 2000, shopping: 3000, transport: 1000 },
      recentActivity
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

      // Rule 1: Low Usage (Cancel)
      if (!sub.usedRecently || sub.lastUsed < fifteenDaysAgo || usageScore < 0.1) {
        recommendations.push({
          type: 'cancel',
          subscriptionId: sub._id,
          name: sub.name,
          message: `Your usage score is low (${(usageScore * 100).toFixed(1)}%). Consider cancelling ${sub.name} to save ₹${sub.price}/month.`,
          priority: sub.price > 500 ? 'high' : 'medium'
        });
      } 
      
      // Rule 2: Plan Optimization (Downgrade/Alternative)
      const alternatives = PLAN_ALTERNATIVES[sub.name] || [];
      alternatives.forEach(alt => {
        if (alt.price < sub.price) {
          recommendations.push({
            type: alt.alternative ? 'alternative' : 'downgrade',
            subscriptionId: sub._id,
            name: sub.name,
            targetPlan: alt.name,
            message: `${alt.reason} Switch to ${alt.name} for ₹${alt.price}.`,
            savings: sub.price - alt.price,
            priority: 'medium'
          });
        }
      });

      // Rule 3: Heavy usage on Weekend/Binge (Personalized Suggestion)
      const weekendUsage = sub.usageLogs.filter(log => {
        const day = new Date(log).getDay();
        return day === 0 || day === 6;
      }).length;
      
      if (weekendUsage > sub.usageLogs.length * 0.8 && sub.plan === 'Premium') {
        recommendations.push({
          type: 'pattern_match',
          subscriptionId: sub._id,
          name: sub.name,
          message: `We detected 80%+ weekend-only usage. A basic plan might be sufficient for your binge habits.`,
          priority: 'low'
        });
      }
    });

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/users/sync", async (req, res) => {
  // Accept either clerkId (web) or googleId (mobile) — both are optional
  const { clerkId, googleId, email, fullName, imageUrl } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: "email is required" });
  }

  console.log(`[Backend Checkpoint] Sync request — email: ${email}, clerkId: ${clerkId || 'none'}, googleId: ${googleId || 'none'}`);

  try {
    // --- Step 1: Find by email (canonical identity) ---
    let user = await User.findOne({ email });

    if (user) {
      // --- Step 2: User exists — link new provider IDs if not already linked ---
      const updates = { lastLogin: new Date() };

      if (fullName && !user.fullName) updates.fullName = fullName;
      if (imageUrl && !user.imageUrl) updates.imageUrl = imageUrl;

      if (clerkId) {
        updates["providerIds.clerk"] = clerkId;
        updates.clerkId = clerkId; // keep backward-compat field in sync
      }
      if (googleId) {
        updates["providerIds.google"] = googleId;
      }

      user = await User.findByIdAndUpdate(user._id, { $set: updates }, { new: true });
      console.log(`✅ [Sync] Existing user found & updated: ${user.email} (_id: ${user._id})`);

    } else {
      // --- Step 3: No user with this email — create one ---
      user = await User.create({
        email,
        fullName: fullName || "",
        imageUrl: imageUrl || "",
        clerkId: clerkId || null,
        providerIds: {
          clerk:  clerkId  || null,
          google: googleId || null,
        },
        gmailConnected: false, // Explicitly false until user completes Gmail OAuth
        googleTokens: null,
        lastLogin: new Date(),
      });
      console.log(`✅ [Sync] New user created: ${user.email} (_id: ${user._id})`);
    }

    // --- Step 4: Detect & merge stale duplicate accounts ---
    // A stale duplicate is a DIFFERENT user document with the same provider ID
    // (can happen from old data before this migration)
    let staleUserId = null;
    if (clerkId) {
      const stale = await User.findOne({ clerkId, _id: { $ne: user._id } });
      if (stale) staleUserId = stale._id.toString();
    }
    if (!staleUserId && googleId) {
      const stale = await User.findOne({ "providerIds.google": googleId, _id: { $ne: user._id } });
      if (stale) staleUserId = stale._id.toString();
    }

    if (staleUserId) {
      const canonicalId = user._id.toString();
      console.log(`⚠️ [Sync] Merging stale user ${staleUserId} → ${canonicalId}`);
      await Promise.all([
        Subscription.updateMany({ userId: staleUserId }, { $set: { userId: canonicalId } }),
        Transaction.updateMany(  { userId: staleUserId }, { $set: { userId: canonicalId } }),
        Notification.updateMany( { userId: staleUserId }, { $set: { userId: canonicalId } }),
      ]);
      await User.findByIdAndDelete(staleUserId);
      console.log(`✅ [Sync] Merge complete. Stale user ${staleUserId} deleted.`);
    }

    // Return the canonical userId as MongoDB _id string
    // Also expose gmailConnected so the frontend can gate Gmail features immediately
    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        userId: user._id.toString(),
        gmailConnected: user.gmailConnected ?? false,
      },
    });

  } catch (error) {
    console.error(`❌ [Sync] Error:`, error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});



app.patch("/api/users/preferences", async (req, res) => {
  const { userId, preferences } = req.body;
  try {
    // userId is now always the canonical MongoDB _id
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { preferences } },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Returns the live gmailConnected state for a user — used by mobile after
// returning from the Gmail OAuth browser flow to refresh its local state.
app.get("/api/users/gmail-status", async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ success: false, error: "userId is required" });
  }
  try {
    const user = await User.findById(userId).select("gmailConnected googleTokens");
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    res.json({
      success: true,
      gmailConnected: user.gmailConnected ?? false,
      hasTokens: !!(user.googleTokens?.access_token),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Smart Notifications Routes ---

app.get("/api/notifications", async (req, res) => {
  const { userId } = req.query;
  try {
    const subs = await Subscription.find({ userId });
    for (const sub of subs) {
      const daysUntilBilling = Math.ceil((new Date(sub.nextBillingDate) - new Date()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilBilling <= 2 && daysUntilBilling > 0) {
        await Notification.findOneAndUpdate(
          { userId, type: 'renewal', subscriptionId: sub._id, read: false },
          { 
            title: `Renewal in ${daysUntilBilling} days`,
            message: `Your ${sub.name} subscription will renew soon for ₹${sub.price}.`,
            priority: 'high'
          },
          { upsert: true }
        );
      }

      if (sub.usageLogs.length === 0 && (new Date() - new Date(sub.createdAt)) > 15 * 24 * 60 * 60 * 1000) {
        await Notification.findOneAndUpdate(
          { userId, type: 'usage_alert', subscriptionId: sub._id, read: false },
          { 
            title: `Unused for 15 days`,
            message: `You haven't used ${sub.name} since you joined. Should we cancel?`,
            priority: 'medium'
          },
          { upsert: true }
        );
      }

      // Check for price increases
      if (sub.priceHistory && sub.priceHistory.length > 1) {
        const lastPrice = sub.priceHistory[sub.priceHistory.length - 2].price;
        if (sub.price > lastPrice) {
          await Notification.findOneAndUpdate(
            { userId, type: 'price_increase', subscriptionId: sub._id, read: false },
            { 
              title: `Price Increase Detected`,
              message: `The price for ${sub.name} increased from ₹${lastPrice} to ₹${sub.price}.`,
              priority: 'critical'
            },
            { upsert: true }
          );
        }
      }
    }

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/notifications/read", async (req, res) => {
  const { notificationId } = req.body;
  try {
    await Notification.findByIdAndUpdate(notificationId, { read: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Google Gmail API Routes ---

app.get("/api/auth/google/url", (req, res) => {
  const { userId } = req.query;
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent", // Force new refresh token
    scope: ["https://www.googleapis.com/auth/gmail.readonly"],
    redirect_uri: process.env.GOOGLE_REDIRECT_URI.trim(),
    state: userId // Pass userId in state
  });
  console.log("Generated Auth URL:", url);
  res.json({ url });
});

app.get("/api/auth/google/callback", async (req, res) => {
  const { code, state, error, error_description } = req.query; // state is the canonical userId (_id)
  console.log(`[Google OAuth Callback] Code received: ${code ? "YES" : "NO"}, State (UserId): ${state}`);
  
  if (error || error_description) {
    console.error(`[Google OAuth Callback] Google returned an OAuth error: ${error} - ${error_description}`);
  }

  if (!code) {
    console.error("[Google OAuth Callback] Error: No code received in query parameters. Query params:", req.query);
    return res.status(400).send(`Authentication failed: ${error_description || error || "Missing authorization code"}`);
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log("[Google OAuth Callback] Exchanged tokens characteristics:", {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : "N/A",
      scopes: tokens.scope
    });

    if (!tokens.refresh_token) {
      console.warn("[Google OAuth Callback] WARNING: No refresh_token returned from Google. If this is a subsequent login, Google will not return a refresh_token unless prompt=consent is enforced.");
    }

    if (state) {
      await User.findByIdAndUpdate(state, {
        googleTokens: tokens,
        gmailConnected: true, // Mark Gmail as connected once we have valid tokens
      });
      console.log(`[Google OAuth Callback] Successfully saved new Google tokens for userId: ${state}`);
    }

    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").trim();
    const redirectUrl = `${frontendUrl}/?scan=true`;
    console.log(`[Google OAuth Callback] Redirecting user to: ${redirectUrl}`);
    res.redirect(redirectUrl);
  } catch (err) {
    console.error("[Google OAuth Callback] Error exchanging code for tokens:", err);
    res.status(500).send("Authentication failed");
  }
});

app.get("/api/gmail/scan", async (req, res) => {
  const { userId, autoSave, accessToken, limit } = req.query;
  const maxResults = limit ? parseInt(limit, 10) : 50;
  console.log(`[Gmail Scan] Initiated scan for userId: ${userId}, autoSave: ${autoSave}, limit: ${maxResults}`);
  try {
    const user = await User.findById(userId);

    if (!user) {
      console.error(`[Gmail Scan] Scan failed: User with ID ${userId} not found in database.`);
      return res.status(404).json({ error: "User not found" });
    }

    // Gate: user must have explicitly connected Gmail AND have a valid access token.
    // Return 200 with skipped:true (not 401) so callers can distinguish
    // "not connected yet" from "token expired" — avoiding noise in logs and UI.
    if (!accessToken && (!user.gmailConnected || !user.googleTokens?.access_token)) {
      console.log(`[Gmail Scan] Skipped: user ${userId} has not connected Gmail (gmailConnected=${user.gmailConnected}).`);
      return res.status(200).json({ success: true, detected: [], skipped: true });
    }

    if (accessToken) {
      oauth2Client.setCredentials({ access_token: accessToken });
      console.log("[Gmail Scan] Credentials set on oauth2Client from query accessToken successfully.");
      
      if (!user.gmailConnected) {
        await User.findByIdAndUpdate(userId, { gmailConnected: true });
      }
    } else {
      console.log(`[Gmail Scan] Retrieved tokens for user ${userId} from DB:`, {
        hasAccessToken: !!user.googleTokens.access_token,
        hasRefreshToken: !!user.googleTokens.refresh_token,
        expiryDate: user.googleTokens.expiry_date ? new Date(user.googleTokens.expiry_date).toISOString() : "N/A",
      });

      oauth2Client.setCredentials(user.googleTokens);
      console.log("[Gmail Scan] Credentials set on oauth2Client successfully.");
    }

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const response = await gmail.users.messages.list({
      userId: "me",
      q: `from:${process.env.BANK_ALERT_EMAIL}`,
      maxResults: maxResults,
    });

    const messages = response.data.messages || [];
    const detected = [];

    console.log(`[Gmail Scan] Found ${messages.length} potential emails to analyze.`);

    // Bulk check for existing transactions/subscriptions to avoid rescanning
    const messageIds = messages.map(m => m.id);
    const existingTxns = await mongoose.model('Transaction').find({ userId, externalId: { $in: messageIds } }, 'externalId').lean();
    const existingSubs = await mongoose.model('Subscription').find({ userId, externalId: { $in: messageIds } }, 'externalId').lean();
    
    const existingIds = new Set([
      ...existingTxns.map(t => t.externalId),
      ...existingSubs.map(s => s.externalId)
    ]);
    
    const newMessages = messages.filter(m => !existingIds.has(m.id));
    console.log(`[Gmail Scan] Skipping ${existingIds.size} already processed emails. ${newMessages.length} new emails to parse.`);

    for (const msg of newMessages) {
      const details = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
      });

      function getEmailBody(payload) {
        let body = '';
        if (payload.parts) {
          for (let part of payload.parts) {
            if (part.mimeType === 'text/plain' && part.body && part.body.data) {
              body += Buffer.from(part.body.data, 'base64').toString('utf8') + ' ';
            } else if (part.mimeType === 'text/html' && part.body && part.body.data) {
              body += Buffer.from(part.body.data, 'base64').toString('utf8') + ' ';
            } else if (part.parts) {
              body += getEmailBody(part) + ' ';
            }
          }
        } else if (payload.body && payload.body.data) {
          body += Buffer.from(payload.body.data, 'base64').toString('utf8');
        }
        return body;
      }

      const snippet = details.data.snippet ? details.data.snippet.toLowerCase() : "";
      const subject = details.data.payload.headers.find(h => h.name === 'Subject')?.value.toLowerCase() || "";
      const fullBody = getEmailBody(details.data.payload).toLowerCase();
      const textToScan = subject + " " + snippet + " " + fullBody;

      const { parseEmail, extractCreditSender } = require("./src/parser/index");
      const parsed = parseEmail(textToScan);
      
      let vendorName = null;
      let type = 'debit';
      let category = "Bank Transaction";
      let domain = "hdfcbank.com";
      let price = "0";

      if (parsed.displayTitle !== "Unknown Transaction" && parsed.confidence > 0) {
         vendorName = parsed.displayTitle.toUpperCase();
         type = parsed.transactionType.toLowerCase();
         price = parsed.amount ? parsed.amount : "0";
         
         if (type === 'credit') {
             const creditData = extractCreditSender(textToScan);
             if (creditData.displayTitle !== "Unknown Sender") {
                 vendorName = creditData.displayTitle.toUpperCase();
             }
         }
      } else {
         // Fallback to simple detection
         if (/\b(credited|credit|received|refunded|deposited|reversal)\b/i.test(textToScan)) {
            type = 'credit';
            const creditData = extractCreditSender(textToScan);
            if (creditData.displayTitle !== "Unknown Sender") {
                 vendorName = creditData.displayTitle.toUpperCase();
            } else {
                 vendorName = 'HDFC CREDIT';
            }
         } else {
            type = 'debit';
            vendorName = 'HDFC DEBIT';
         }
      }

      // If price is still "0" or null, try extracting it manually (useful for generic VPAs where we didn't extract amount)
      if (!price || price === "0") {
         const priceMatch = textToScan.match(/(?:₹|\$|rs\.?|usd|inr)\s?(\d+(?:[.,]\d{2})?)/i);
         price = priceMatch ? priceMatch[1] : "0";
      }

      console.log(`[Gmail Scan] Parsing email ID: ${msg.id} | Detected Type: ${type}`);

      if (vendorName) {
        console.log(`[Gmail Scan] Parsed Alert details - Vendor: ${vendorName} | Price: ${price} | Category: ${category} | Type: ${type}`);

        // Filter out if already added as a subscription or transaction
        const Subscription = mongoose.model('Subscription');
        const Transaction = mongoose.model('Transaction');
        
        const alreadyExistsInSub = await Subscription.findOne({ userId, externalId: msg.id });
        const alreadyExistsInTxn = await Transaction.findOne({ userId, externalId: msg.id });

        if (!alreadyExistsInSub && !alreadyExistsInTxn) {
           if (autoSave === 'true') {
             const newTxn = new Transaction({
               userId,
               name: vendorName,
               amount: parseFloat(price.replace(',', '')),
               category: category,
               logo: `https://www.google.com/s2/favicons?sz=128&domain=${domain}`,
               externalId: msg.id,
               type: type,
               date: new Date(parseInt(details.data.internalDate))
             });
             await newTxn.save();
           }

           if (!detected.find(d => d.name === vendorName)) {
             detected.push({
               name: vendorName,
               price: price.replace(',', ''),
               plan: 'Detected Alert',
               category: category,
               logo: `https://www.google.com/s2/favicons?sz=128&domain=${domain}`,
               detectedFrom: details.data.payload.headers.find(h => h.name === 'Subject')?.value || "Bank Alert",
               date: parseInt(details.data.internalDate),
               externalId: msg.id,
               type: type
             });
           }
        }
      }
    }

    res.json({ success: true, detected });
  } catch (error) {
    console.error("[Gmail Scan] Scan failed with error:", error);
    let responseDataStr = "";
    if (error.response?.data) {
      try {
        responseDataStr = JSON.stringify(error.response.data);
      } catch (_) {
        responseDataStr = String(error.response.data);
      }
    }

    const errString = [
      error.message,
      error.stack,
      error.code,
      error.response?.status,
      responseDataStr,
      error.toString()
    ].filter(Boolean).join(" ").toLowerCase();

    console.error(`[Gmail Scan] Full error log: ${errString}`);

    if (errString.includes("no refresh token") || errString.includes("invalid_grant")) {
      console.warn(`[Gmail Scan] Detected invalid_grant or missing refresh token for user ${userId}. Clearing stored credentials from DB.`);
      if (userId) {
         try {
           // Clear both the tokens and the connected flag so the UI re-prompts OAuth
           await User.findByIdAndUpdate(userId, { googleTokens: null, gmailConnected: false });
           console.log(`[Gmail Scan] Successfully cleared googleTokens and gmailConnected for user ${userId}.`);
         } catch (dbErr) {
           console.error(`[Gmail Scan] Failed to clear googleTokens for user ${userId}:`, dbErr);
         }
      }
      return res.status(401).json({ error: "Google authentication expired. Please re-authenticate." });
    }
    res.status(500).json({ error: "Failed to scan Gmail" });
  }
});

app.get("/api/insights/patterns", async (req, res) => {
  const { userId } = req.query;
  try {
    const txns = await Transaction.find(userId ? { userId } : {});
    
    let foodTxns = [];
    let shoppingTxns = [];
    let weekendFood = 0;
    let lateNightOrders = 0;
    let totalFoodSpend = 0;

    txns.forEach(t => {
      const isFood = ['Food', 'Zomato', 'Swiggy', 'Blinkit', 'Zepto'].includes(t.category) || /zomato|swiggy|uber eats/i.test(t.name);
      const isShopping = ['Shopping', 'Amazon', 'Flipkart'].includes(t.category) || /amazon|flipkart|myntra/i.test(t.name);
      
      const date = new Date(t.date || Date.now());
      const day = date.getDay();
      const hour = date.getHours();

      if (isFood) {
        foodTxns.push(t);
        totalFoodSpend += t.amount || 0;
        if (day === 0 || day === 6) weekendFood++;
        if (hour >= 22 || hour <= 4) lateNightOrders++;
      }
      if (isShopping) {
        shoppingTxns.push(t);
      }
    });

    const insights = [];

    // Food behaviors
    if (foodTxns.length >= 2) {
      if (weekendFood > foodTxns.length * 0.5) {
        insights.push({ type: 'food', title: 'Weekend Craver', message: 'You order food mostly on weekends. Try meal-prepping on Sundays to save here!' });
      } else {
        const potentialSavings = Math.round((totalFoodSpend / foodTxns.length) * 2 * 4); // saving 2 orders a week
        insights.push({ type: 'food', title: 'High Frequency', message: `You order food frequently. Reducing this by 2 orders/wk helps you save ₹${potentialSavings || 800}/mo!` });
      }
    }

    // Late night
    if (lateNightOrders > 0) {
      insights.push({ type: 'behavioral', title: 'Late Night Spikes', message: `Your spending spikes after 10 PM. Try keeping a late-night snack box at home!` });
    }

    // Shopping
    if (shoppingTxns.length >= 1) {
      const shopSpend = shoppingTxns.reduce((sum, t) => sum + (t.amount || 0), 0);
      insights.push({ type: 'shopping', title: 'Impulse Spikes', message: `Shopping impulse detected (₹${Math.round(shopSpend)}). Wait 24h before closing checkout to verify if it's a need.` });
    }

    res.json({ success: true, insights });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/chat", async (req, res) => {
  const { message, userId } = req.body;
  try {
    const subs = await Subscription.find(userId ? { userId } : {});
    const msg = message.toLowerCase();
    
    let reply = "I am your SubZero Financial Assistant. I analyze your subscriptions and find you savings. How can I help you today?";
    
    if (msg.includes("save") || msg.includes("savings")) {
      const unusedSubs = subs.filter(s => !s.usedRecently);
      const totalSavings = unusedSubs.reduce((sum, s) => sum + s.price, 0);
      if(totalSavings > 0) {
        reply = `You have ${unusedSubs.length} unused subscriptions. If you cancel them, you can save ₹${totalSavings} this month!`;
      } else {
        reply = `You are fully optimized right now! All your subscriptions show regular usage. But I can monitor for better deals.`;
      }
    } else if (msg.includes("cancel") || msg.includes("waste") || msg.includes("wasting") || msg.includes("where am i wasting")) {
      const txns = await Transaction.find(userId ? { userId } : {});
      let foodSpend = txns.filter(t => ['Food', 'Zomato', 'Swiggy'].includes(t.category) || /zomato|swiggy|uber eats/i.test(t.name)).reduce((sum, t) => sum + (t.amount || 0), 0);

      const worstSub = subs.sort((a,b) => b.price - a.price).find(s => !s.usedRecently);
      
      if (foodSpend > 1500) {
           reply = `Looking at your data, you spent ₹${foodSpend} on food deliveries recently. This is a huge area for optimization! `;
           if (worstSub) {
             reply += `Also, I recommend canceling **${worstSub.name}** right now, it costs ₹${worstSub.price} and hasn't been used.`;
           } else {
             reply += `I'd try to stick to an ₹150 avg meal to save more.`;
           }
      } else if (worstSub) {
        reply = `I highly recommend canceling **${worstSub.name}** right now. It costs ₹${worstSub.price} and hasn't been used in over 15 days.`;
      } else {
        reply = `You don't have any obvious unused subscriptions. However, if you switch your highest expense to a Family Plan, you could save!`;
      }
    } else if (msg.includes("hello") || msg.includes("hi")) {
      reply = "Hello! I am your AI concierge. Ask me how to save more or what you should cancel!";
    }

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 [Backend Checkpoint] Server running on port ${PORT}`));