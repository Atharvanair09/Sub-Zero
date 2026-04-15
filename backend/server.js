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
  const { userId, name, price, plan, logo, color, category, billingCycle, nextBillingDate, externalId } = req.body;
  
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
         externalId
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
    const user = await User.findOne({ clerkId: userId });
    
    // Get recent transactions to accurately calculate monthly spend
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const txns = await Transaction.find({ userId, date: { $gte: thirtyDaysAgo } });
    
    const subSpend = subs.reduce((sum, s) => sum + (s.billingCycle === 'monthly' ? s.price : s.price / 12), 0);
    const txnSpend = txns.reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const monthlySpend = subSpend + txnSpend;
    const yearlyProjection = (subSpend * 12) + (txnSpend * 12);
    
    // Financial Intelligence
    const foodSpend = txns.filter(t => ['Food', 'Zomato', 'Swiggy'].includes(t.category) || /zomato|swiggy|uber eats/i.test(t.name)).reduce((sum, t) => sum + (t.amount || 0), 0);
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

    res.json({
      monthlySpend,
      yearlyProjection,
      pieChart,
      totalSubs: subs.length,
      totalTxns: txns.length,
      foodSpend,
      subPercent,
      healthScore,
      monthlyBudget: user?.preferences?.monthlyBudget || 0
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
  const { code, state } = req.query; // state is the userId
  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    if (state) {
      await User.findOneAndUpdate({ clerkId: state }, { googleTokens: tokens });
    }

    res.redirect("http://localhost:5173/?scan=true");
  } catch (error) {
    console.error("Error exchanging code for tokens", error);
    res.status(500).send("Authentication failed");
  }
});

app.get("/api/gmail/scan", async (req, res) => {
  const { userId } = req.query;
  try {
    const user = await User.findOne({ clerkId: userId });
    
    if (!user || !user.googleTokens) {
      return res.status(401).json({ error: "Not authenticated with Google" });
    }

    oauth2Client.setCredentials(user.googleTokens);
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const response = await gmail.users.messages.list({
      userId: "me",
      q: "subject:(debited OR spent OR \"alert for\" OR txn OR \"payment confirmed\" OR \"transaction alert\") \"bank\" OR \"account\" OR \"a/c\" OR HDFC OR ICICI OR SBI OR AXIS OR Kotak",
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
        { name: 'Amazon', domain: 'amazon.in', category: 'Shopping' },
        { name: 'Flipkart', domain: 'flipkart.com', category: 'Shopping' },
        { name: 'YouTube', domain: 'youtube.com', category: 'OTT' },
        { name: 'Disney', domain: 'disneyplus.com', category: 'OTT' },
        { name: 'LinkedIn', domain: 'linkedin.com', category: 'Work' },
        { name: 'Adobe', domain: 'adobe.com', category: 'Work' },
        { name: 'Canva', domain: 'canva.com', category: 'Design' },
        { name: 'ChatGPT', domain: 'openai.com', category: 'AI' },
        { name: 'Apple', domain: 'apple.com', category: 'Tech' },
        { name: 'Google One', domain: 'google.com', category: 'Storage' },
        { name: 'Microsoft', domain: 'microsoft.com', category: 'Work' },
        { name: 'GitHub', domain: 'github.com', category: 'Work' },
        { name: 'Hotstar', domain: 'hotstar.com', category: 'Streaming' },
        { name: 'Zomato', domain: 'zomato.com', category: 'Food' },
        { name: 'Swiggy', domain: 'swiggy.com', category: 'Food' },
        { name: 'Uber', domain: 'uber.com', category: 'Transport' },
        { name: 'Ola', domain: 'olacabs.com', category: 'Transport' },
        { name: 'Rapido', domain: 'rapido.bike', category: 'Transport' },
        { name: 'Blinkit', domain: 'blinkit.com', category: 'Food' },
        { name: 'Zepto', domain: 'zeptonow.com', category: 'Food' }
      ];

      const textForRegex = subject + " " + snippet;
      let matchedVendor = vendors.find(v => textForRegex.includes(v.name.toLowerCase()));
      
      let vendorName = matchedVendor ? matchedVendor.name : null;
      let category = matchedVendor ? matchedVendor.category : "Subscription";
      let domain = matchedVendor ? matchedVendor.domain : "google.com";

      // Dynamic Extraction for Banks (Fallback)
      if (!vendorName) {
        // Look for patterns like "at [VENDOR]", "to [VENDOR]", "spent on [VENDOR]"
        const merchantMatch = textForRegex.match(/(?:at|to|on|toward|towards)\s+([A-Z0-0\s\.]+?)(?:\s+using|\s+on|\s+at|\s+branch|\s+for|\s+card|\.|\n|$)/i);
        if (merchantMatch && merchantMatch[1]) {
           const potential = merchantMatch[1].trim();
           // Filter out common noise
           if (potential.length > 2 && !['your', 'a', 'the', 'rs'].includes(potential.toLowerCase())) {
              vendorName = potential.split(' ')[0].toUpperCase(); // Take first word for simplicity
              category = "Bank Transaction";
           }
        }
      }

      if (vendorName) {
        const priceMatch = textForRegex.match(/(?:₹|\$|rs\.?|usd|inr)\s?(\d+(?:[.,]\d{2})?)/i);
        const price = priceMatch ? priceMatch[1] : "199";

        // Filter out if already added as a subscription or transaction
        const Subscription = mongoose.model('Subscription');
        const Transaction = mongoose.model('Transaction');
        
        const alreadyExistsInSub = await Subscription.findOne({ userId, externalId: msg.id });
        const alreadyExistsInTxn = await Transaction.findOne({ userId, externalId: msg.id });

        if (!alreadyExistsInSub && !alreadyExistsInTxn && !detected.find(d => d.name === vendorName)) {
           detected.push({
             name: vendorName,
             price: price.replace(',', ''),
             plan: 'Detected Alert',
             category: category,
             logo: `https://www.google.com/s2/favicons?sz=128&domain=${domain}`,
             detectedFrom: details.data.payload.headers.find(h => h.name === 'Subject')?.value || "Bank Alert",
             date: parseInt(details.data.internalDate),
             externalId: msg.id
           });
        }
      }
    }

    res.json({ success: true, detected });
  } catch (error) {
    console.error("Gmail scan error", error);
    if (error.message && (error.message.includes("No refresh token") || error.message.includes("invalid_grant"))) {
      if (userId) {
         await User.findOneAndUpdate({ clerkId: userId }, { googleTokens: null });
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