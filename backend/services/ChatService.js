const subscriptionRepository = require('../repositories/SubscriptionRepository');
const transactionRepository = require('../repositories/TransactionRepository');
const CategorizationEngine = require('../domain/engines/CategorizationEngine');
const FinancialHealthEngine = require('../domain/engines/FinancialHealthEngine');

class ChatService {
  static async getChatReply({ message, userId }) {
    const subs = await subscriptionRepository.findMany(userId ? { userId } : {});
    const msg = message.toLowerCase();
    
    let reply = "I am your SubZero Financial Assistant. I analyze your subscriptions and find you savings. How can I help you today?";
    
    if (msg.includes("save") || msg.includes("savings")) {
      const unusedSubs = subs.filter(s => !s.usedRecently);
      const totalSavings = FinancialHealthEngine.calculateUnusedSubscriptionSavings(unusedSubs);
      if(totalSavings > 0) {
        reply = `You have ${unusedSubs.length} unused subscriptions. If you cancel them, you can save ₹${totalSavings} this month!`;
      } else {
        reply = `You are fully optimized right now! All your subscriptions show regular usage. But I can monitor for better deals.`;
      }
    } else if (msg.includes("cancel") || msg.includes("waste") || msg.includes("wasting") || msg.includes("where am i wasting")) {
      const txns = await transactionRepository.findMany(userId ? { userId } : {});
      let foodSpend = CategorizationEngine.calculateCategorySpend(txns, 'Food');

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

    return reply;
  }
}

module.exports = ChatService;
