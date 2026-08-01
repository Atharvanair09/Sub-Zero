const userRepository = require('../repositories/UserRepository');
const subscriptionRepository = require('../repositories/SubscriptionRepository');
const transactionRepository = require('../repositories/TransactionRepository');
const notificationRepository = require('../repositories/NotificationRepository');

class UserController {
  static async sync(req, res) {
    // Accept either clerkId (web) or googleId (mobile) — both are optional
    const { clerkId, googleId, email, fullName, imageUrl } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: "email is required" });
    }

    console.log(`[Backend Checkpoint] Sync request — email: ${email}, clerkId: ${clerkId || 'none'}, googleId: ${googleId || 'none'}`);

    try {
      // --- Step 1: Find by email (canonical identity) ---
      let user = await userRepository.findOne({ email });

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

        user = await userRepository.updateById(user._id, { $set: updates }, { new: true });
        console.log(`✅ [Sync] Existing user found & updated: ${user.email} (_id: ${user._id})`);

      } else {
        // --- Step 3: No user with this email — create one ---
        user = await userRepository.create({
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
        const stale = await userRepository.findOne({ clerkId, _id: { $ne: user._id } });
        if (stale) staleUserId = stale._id.toString();
      }
      if (!staleUserId && googleId) {
        const stale = await userRepository.findOne({ "providerIds.google": googleId, _id: { $ne: user._id } });
        if (stale) staleUserId = stale._id.toString();
      }

      if (staleUserId) {
        const canonicalId = user._id.toString();
        console.log(`⚠️ [Sync] Merging stale user ${staleUserId} → ${canonicalId}`);
        await Promise.all([
          subscriptionRepository.updateMany({ userId: staleUserId }, { $set: { userId: canonicalId } }),
          transactionRepository.updateMany(  { userId: staleUserId }, { $set: { userId: canonicalId } }),
          notificationRepository.updateMany( { userId: staleUserId }, { $set: { userId: canonicalId } }),
        ]);
        await userRepository.deleteById(staleUserId);
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
  }

  static async updatePreferences(req, res) {
    const { userId, preferences } = req.body;
    try {
      // userId is now always the canonical MongoDB _id
      const user = await userRepository.updateById(
        userId,
        { $set: { preferences } },
        { new: true }
      );
      res.json({ success: true, user });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = UserController;
