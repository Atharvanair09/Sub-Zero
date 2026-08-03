const { z } = require('zod');

// Common fields
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');
const stringId = z.string().min(1);

const baseQuery = z.object({
  userId: stringId,
});

// Subscription Schemas
const SubscriptionCreateSchema = z.object({
  userId: stringId,
  name: z.string().min(1),
  price: z.number().positive(),
  plan: z.string().optional(),
  billingCycle: z.enum(['monthly', 'yearly', 'weekly']).optional(),
  status: z.enum(['active', 'cancelled']).optional(),
  nextBillingDate: z.string().datetime().optional().or(z.date().optional()),
  externalId: z.string().optional(),
}).passthrough();

const SubscriptionLogUsageSchema = z.object({
  id: stringId,
  usedRecently: z.boolean(),
});

const SubscriptionCancelSchema = z.object({
  id: stringId,
});

// Transaction Schemas
const TransactionCreateSchema = z.object({
  userId: stringId,
  name: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().datetime().optional().or(z.date().optional()),
  category: z.string().optional(),
  type: z.enum(['income', 'expense']).optional(),
}).passthrough();

const ParamsIdSchema = z.object({
  id: stringId,
});

// User Schemas
const UserSyncSchema = z.object({
  clerkId: z.string().min(1),
  email: z.string().email(),
  fullName: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
});

const UserPreferencesSchema = z.object({
  userId: stringId,
  preferences: z.object({
    monthlyBudget: z.number().nonnegative().optional(),
    categoryBudgets: z.record(z.number().nonnegative()).optional(),
    notificationsEnabled: z.boolean().optional(),
    onboarded: z.boolean().optional(),
  }).passthrough()
});

// Notification Schemas
const NotificationMarkReadSchema = z.object({
  notificationId: stringId,
});

const GmailCallbackSchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
}).passthrough();

// Chat Schemas
const ChatSchema = z.object({
  userId: stringId,
  message: z.string().min(1),
}).passthrough();

// Income Schemas
const IncomeCreateSchema = z.object({
  userId: stringId,
  name: z.string().min(1),
  amount: z.number().positive(),
  cycle: z.string().optional(),
}).passthrough();

const IncomeUpdateSchema = IncomeCreateSchema.partial();

// Goal Schemas
const GoalCreateSchema = z.object({
  userId: stringId,
  name: z.string().min(1),
  targetAmount: z.number().positive(),
  targetDate: z.string().datetime().optional().or(z.date().optional()),
}).passthrough();

const GoalAllocationCreateSchema = z.object({
  userId: stringId,
  goalId: stringId,
  amount: z.number().positive(),
}).passthrough();

// Budget Schemas
const BudgetCreateSchema = z.object({
  userId: stringId,
  category: z.string().min(1),
  amount: z.number().positive(),
}).passthrough();

// CashFlow Schemas
const CashFlowProcessSchema = z.object({
  userId: stringId,
  transactionId: stringId.optional(),
  amount: z.number().optional(),
}).passthrough();

module.exports = {
  baseQuery,
  ParamsIdSchema,
  schemas: {
    SubscriptionCreate: { body: SubscriptionCreateSchema },
    SubscriptionList: { query: baseQuery },
    SubscriptionLogUsage: { body: SubscriptionLogUsageSchema },
    SubscriptionCancel: { body: SubscriptionCancelSchema },
    
    TransactionCreate: { body: TransactionCreateSchema },
    TransactionList: { query: baseQuery },
    TransactionDelete: { params: ParamsIdSchema },
    
    DashboardStats: { query: baseQuery },
    InsightRecommendations: { query: baseQuery },
    InsightPatterns: { query: baseQuery },
    
    UserSync: { body: UserSyncSchema },
    UserPreferences: { body: UserPreferencesSchema },
    
    NotificationList: { query: baseQuery },
    NotificationMarkRead: { body: NotificationMarkReadSchema },
    
    GmailStatus: { query: baseQuery },
    GmailAuthUrl: { query: baseQuery },
    GmailScan: { query: baseQuery.passthrough() },
    GmailCallback: { query: GmailCallbackSchema },
    
    Chat: { body: ChatSchema },
    
    IncomeCreate: { body: IncomeCreateSchema },
    IncomeList: { query: baseQuery },
    IncomeUpdate: { params: ParamsIdSchema, body: IncomeUpdateSchema },
    IncomeDelete: { params: ParamsIdSchema },
    
    GoalCreate: { body: GoalCreateSchema },
    GoalList: { query: baseQuery },
    GoalAllocationCreate: { body: GoalAllocationCreateSchema },
    GoalAllocationList: { query: baseQuery },
    
    BudgetCreate: { body: BudgetCreateSchema },
    BudgetList: { query: baseQuery },
    
    CashFlowSummary: { query: baseQuery },
    CashFlowProcess: { body: CashFlowProcessSchema },
  }
};
