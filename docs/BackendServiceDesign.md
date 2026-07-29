# Sub-Zero Backend Service Design

Version: 1.0

Purpose:

This document defines the responsibilities, ownership, dependencies, APIs, MongoDB collections, and events for every backend service in Sub-Zero.

Every backend feature must belong to one existing service.

If a new service is required, this document must be updated before implementation.

---

# Backend Architecture

Client (Flutter)

↓

REST API

↓

Controllers

↓

Services

↓

Engines

↓

Repositories

↓

MongoDB

Controllers handle HTTP.

Services orchestrate business workflows.

Engines perform deterministic business logic.

Repositories are the only layer allowed to communicate with MongoDB.

---

# Service Ownership Rules

Every business domain has exactly one owner.

No responsibility may exist in multiple services.

Services communicate through interfaces or events.

Services never access another service's database collections directly.

---

# 1. Authentication Service

Purpose

Handles user authentication and authorization.

Responsibilities

- Google OAuth Login
- JWT Generation
- Session Validation
- Logout
- Refresh Token Management

Does NOT

- Read Gmail
- Parse Transactions
- Perform Financial Calculations

Collections

users

Dependencies

Google OAuth

Outputs

Authenticated User

JWT

Refresh Token

---

# 2. Gmail Sync Service

Purpose

Synchronize Gmail incrementally.

Responsibilities

- Gmail OAuth
- Incremental Sync
- History API
- Message Retrieval
- Scheduler
- Sync Status

Does NOT

- Parse emails
- Store transactions
- Categorize merchants

Collections

gmailSyncState

Dependencies

Google Gmail API

Outputs

Raw Emails

Triggers

Transaction Validation Engine

---

# 3. Transaction Validation Engine

Purpose

Determine whether an email represents a real financial transaction.

Responsibilities

- Reminder Detection
- Promotional Email Detection
- OTP Detection
- Completed Transaction Detection

Outputs

Validated Email

Rejected Email

Does NOT

Parse transactions.

Collections

None

---

# 4. Transaction Parser Engine

Purpose

Extract structured financial data.

Responsibilities

Extract

- Amount
- Credit/Debit
- Timestamp
- Reference Number
- Account
- Merchant
- Sender

Outputs

Parsed Transaction

Collections

None

---

# 5. Merchant Extraction Engine

Purpose

Extract the real merchant or sender.

Responsibilities

Normalize

Amazon Pay India Pvt Ltd

↓

Amazon

Extract

Sender

Receiver

Merchant

Confidence Score

Collections

merchantAliases

Outputs

Normalized Merchant

---

# 6. Category Engine

Purpose

Assign transaction categories.

Responsibilities

Rule-based categorization

Food

Shopping

Travel

Bills

Entertainment

Healthcare

Education

Others

Collections

categoryRules

Outputs

Transaction Category

---

# 7. Income Engine

Purpose

Manage recurring income sources.

Responsibilities

Income Source Matching

Income Confirmation

Recurring Income Detection

Income Source Suggestions

Outputs

Income Source

Income Confirmation Event

Collections

incomeSources

Dependencies

Transaction Parser

---

# 8. Cash Flow Engine

Purpose

Single owner of every financial calculation.

Responsibilities

Income Cycles

Goal Allocation

Budget Allocation

Remaining Income

Budget Usage

Overspending

Monthly Reconciliation

Available Spending

Virtual Goal Balances

Financial Totals

Collections

incomeCycles

goalAllocations

categoryBudgets

budgetUsage

Dependencies

Income Engine

Category Engine

Outputs

Cash Flow Summary

Budget Summary

Goal Progress

Overspending Event

Rules

No other service may perform these calculations.

---

# 9. Goal Service

Purpose

Manage savings goals.

Responsibilities

Create Goal

Delete Goal

Goal Metadata

Target Amount

Target Date

Goal Images

Goal Status

Collections

goals

Does NOT

Calculate Goal Balances

Goal balances are calculated by the Cash Flow Engine.

---

# 10. Financial Health Engine

Purpose

Calculate the Financial Health Score.

Responsibilities

Savings Rate

Income Stability

Budget Adherence

Spending Consistency

Outputs

Score

Recommendations

Collections

None

Dependencies

Cash Flow Engine

---

# 11. Insight Engine

Purpose

Generate analytics.

Responsibilities

Monthly Reports

Trend Detection

Spending Breakdown

Income Breakdown

Goal Analytics

Budget Analytics

Collections

None

Dependencies

Cash Flow Engine

Category Engine

---

# 12. Notification Service

Purpose

Deliver user notifications.

Responsibilities

Budget Alerts

Goal Milestones

Income Confirmed

Overspending

Reminder Notifications

Collections

notifications

Does NOT

Calculate business logic.

---

# 13. Encryption Service

Purpose

Protect sensitive financial information.

Responsibilities

Encrypt sensitive MongoDB fields

Decrypt authorized data

Mask confidential information

Generate secure hashes

Collections

None

Dependencies

Environment Keys

Outputs

Encrypted Documents

Rules

Every MongoDB write containing sensitive information must pass through this service.

---

# 14. Logging Service

Purpose

Centralized logging.

Responsibilities

INFO

WARN

ERROR

DEBUG

Collections

None

Logs

Never store

OAuth Tokens

Passwords

Email Bodies

Reference Numbers

Account Numbers

---

# Repository Layer

Repositories own MongoDB.

Repositories

UserRepository

TransactionRepository

IncomeRepository

GoalRepository

BudgetRepository

NotificationRepository

Repositories never contain business logic.

---

# Event Flow

TransactionImported

↓

ValidationPassed

↓

TransactionParsed

↓

MerchantExtracted

↓

CategoryAssigned

↓

IncomeMatched

↓

IncomeConfirmed

↓

CashFlowUpdated

↓

GoalUpdated

↓

BudgetUpdated

↓

FinancialHealthUpdated

↓

NotificationCreated

↓

Frontend Refresh

---

# Service Communication Rules

Services communicate only through:

- Interfaces
- Events
- Repositories

Services must never directly manipulate another service's internal state.

---

# Dependency Rules

Authentication

↓

Gmail Sync

↓

Validation

↓

Parser

↓

Merchant

↓

Category

↓

Income

↓

Cash Flow

↓

Financial Health

↓

Insights

↓

Notifications

Dependencies must always flow downward.

Circular dependencies are prohibited.

---

# AI Implementation Rules

Before implementing a feature, determine:

1. Which service owns it?
2. Which engine performs the business logic?
3. Which repository stores the data?
4. Which MongoDB collection is used?
5. Which events are generated?
6. Which API exposes the feature?

If the answer is "create a new service", stop implementation and update this document first.

No feature may duplicate an existing responsibility.

Every implementation must extend the existing architecture rather than introducing parallel logic.