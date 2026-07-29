# DATA_FLOW_SPECIFICATION.md

Version: 1.0

Purpose:

This document defines how data flows through the Sub-Zero backend.

It specifies:

- Processing pipelines
- Ownership of each stage
- Inputs
- Outputs
- Trigger conditions
- Events generated
- MongoDB write points

Every feature implementation must follow one of the documented data flows.

If a feature requires a new flow, this document must be updated before implementation.

---

# Master System Flow

The following diagram represents the complete backend processing pipeline of Sub-Zero.

Every feature implemented within the system must integrate into this architecture without bypassing existing stages.

```
                                    USER
                                      │
                                      ▼
                               Flutter Application
                                      │
                               REST API Requests
                                      │
                           API Controllers (Express)
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            │                         │                         │
            ▼                         ▼                         ▼
   Authentication Service      Gmail Sync Service        Goal Service
            │                         │                         │
            │                  Incremental Sync                │
            │                         │                         │
            └──────────────┐          ▼          ┌──────────────┘
                           │    Raw Gmail Emails │
                           │          │          │
                           ▼          ▼          ▼
                 Transaction Validation Engine
                           │
            ┌──────────────┴──────────────┐
            │                             │
            ▼                             ▼
      Invalid / Reminder             Valid Transaction
      Promotional Email                    │
            │                              ▼
            │                  Transaction Parser Engine
            │                              │
            │                              ▼
            │                 Merchant Extraction Engine
            │                              │
            │                              ▼
            │                     Category Engine
            │                              │
            │                              ▼
            │                      Income Engine
            │                              │
            │                              ▼
            │                     Cash Flow Engine
            │                              │
            │      ┌───────────────────────┼────────────────────────┐
            │      │                       │                        │
            │      ▼                       ▼                        ▼
            │ Goal Allocation       Budget Allocation     Income Cycles
            │      │                       │                        │
            │      └───────────────┬───────┴──────────────┬─────────┘
            │                      ▼                      │
            │           Financial Health Engine           │
            │                      │                      │
            │                      ▼                      │
            │                Insight Engine              │
            │                      │                      │
            │                      ▼                      │
            │             Notification Service            │
            │                      │                      │
            └──────────────────────┼──────────────────────┘
                                   ▼
                         Repository Layer (MongoDB Only)
                                   │
            ┌──────────────────────┼──────────────────────────────┐
            ▼                      ▼                              ▼
      Transaction Repo       Income Repo                   Goal Repo
            │                      │                              │
            └──────────────┬───────┴──────────────┬───────────────┘
                           ▼                      ▼
                      Budget Repo         Notification Repo
                                   │
                                   ▼
                                MongoDB
                                   │
                                   ▼
                           REST API Response
                                   │
                                   ▼
                           Flutter UI Refresh
```

---

# Architecture Principles

The Master System Flow enforces the following architectural principles:

1. Every transaction follows a single deterministic pipeline.
2. Business logic exists only within the backend.
3. Every stage has one owner.
4. MongoDB is accessed only through repositories.
5. Data flows in one direction only.
6. Financial calculations are centralized within the Cash Flow Engine.
7. Services orchestrate workflows.
8. Engines perform deterministic business logic.
9. Controllers handle HTTP communication only.
10. Flutter is responsible only for presentation and user interaction.

---

# Data Flow Rules

Every request entering the backend must satisfy the following rules.

Authentication Requests

Flutter
→ Authentication Service
→ Repository
→ MongoDB
→ Response

Financial Transactions

Flutter
→ Gmail Sync
→ Validation
→ Parser
→ Merchant Extraction
→ Category
→ Income
→ Cash Flow
→ Repository
→ MongoDB
→ Response

Goal Operations

Flutter
→ Goal Service
→ Cash Flow Engine
→ Repository
→ MongoDB
→ Response

Budget Operations

Flutter
→ Budget API
→ Cash Flow Engine
→ Repository
→ MongoDB
→ Response

Notifications

Event
→ Notification Service
→ Repository
→ MongoDB
→ Flutter

---

# Forbidden Data Flows

The following operations are explicitly prohibited.

❌ Flutter directly calculating budgets

❌ Flutter calculating financial health

❌ Gmail Sync writing directly to MongoDB

❌ Parser assigning categories

❌ Category Engine calculating budgets

❌ Goal Service calculating balances

❌ Notification Service performing business logic

❌ Services writing directly to MongoDB without repositories

❌ Duplicate implementations of the same business logic

---

# Single Responsibility Map

| Layer | Responsibility |
|---------|---------------|
| Flutter | UI & User Interaction |
| Controllers | HTTP Request Handling |
| Services | Workflow Orchestration |
| Engines | Business Logic |
| Repositories | Database Access |
| MongoDB | Persistent Storage |

---

# System Lifecycle

Every financial transaction must progress through the following lifecycle.

Email Received

↓

Incremental Synchronization

↓

Validation

↓

Parsing

↓

Merchant Extraction

↓

Category Assignment

↓

Income Detection

↓

Cash Flow Calculation

↓

Budget Update

↓

Goal Update

↓

Financial Health Update

↓

Notification Generation

↓

Database Persistence

↓

Frontend Refresh

No stage may be skipped or reordered unless the architecture documentation is updated.

---

# General Processing Rules

Every workflow follows these principles:

1. Each stage has exactly one owner.
2. Data only flows forward.
3. No stage skips another stage.
4. Business logic is executed only by its designated Engine.
5. MongoDB writes occur only through Repositories.
6. The frontend never performs business logic.
7. Every flow ends with a deterministic backend state.

---

# Flow 1 – User Authentication

Trigger

User taps "Continue with Google"

Flow

Flutter

↓

Authentication Controller

↓

Authentication Service

↓

Google OAuth

↓

User Repository

↓

MongoDB

↓

JWT Generation

↓

Flutter

Output

Authenticated User

Session Created

---

# Flow 2 – Gmail Synchronization

Trigger

Automatic Scheduler

OR

Manual Refresh

OR

App Resume

Flow

Flutter

↓

Gmail Sync Controller

↓

Gmail Sync Service

↓

Google Gmail API

↓

Incremental Email Retrieval

↓

Raw Email Queue

Output

Raw Emails

Next Flow

Transaction Validation

Rules

Never rescan the full inbox.

Only fetch new transaction emails.

---

# Flow 3 – Transaction Validation

Trigger

Raw Email

Flow

Raw Email

↓

Transaction Validation Engine

↓

Completed Transaction?

├── No
│ ↓
│ Ignore Email
│
└── Yes
↓
Transaction Parser

Outputs

Validated Email

Rejected Email

Rules

Reminder emails must never create transactions.

Promotional emails must never create transactions.

---

# Flow 4 – Transaction Parsing

Trigger

Validated Email

Flow

Validated Email

↓

Transaction Parser Engine

↓

Extract

- Amount
- Type
- Merchant
- Sender
- Receiver
- Timestamp
- Reference Number

↓

Parsed Transaction

Output

Structured Transaction

Rules

No database writes occur here.

---

# Flow 5 – Merchant Extraction

Trigger

Parsed Transaction

Flow

Parsed Transaction

↓

Merchant Extraction Engine

↓

Normalize Merchant

↓

Confidence Score

↓

Merchant Alias Lookup

↓

Final Merchant

Output

Normalized Transaction

---

# Flow 6 – Category Assignment

Trigger

Normalized Transaction

Flow

Transaction

↓

Category Engine

↓

Category Rules

↓

Assigned Category

↓

Transaction Repository

↓

MongoDB

Output

Categorized Transaction

---

# Flow 7 – Income Detection

Trigger

Categorized Credit Transaction

Flow

Credit Transaction

↓

Income Engine

↓

Income Source Match

↓

Match Found?

├── No
│ ↓
│ Store as Normal Credit
│
└── Yes
↓
Income Cycle Lookup

↓

Current Cycle Exists?

├── Yes
│ ↓
│ Ignore Duplicate Income
│
└── No
↓
Expected Amount Match?

├── Yes
│ ↓
│ Confirm Automatically
│
└── No
↓
Create Confirmation Request

↓

Cash Flow Engine

Outputs

Income Confirmed

Income Confirmation Required

Normal Credit

Rules

One confirmed income per income source per cycle.

---

# Flow 8 – Cash Flow Processing

Trigger

Income Confirmed

Expense Added

Budget Changed

Goal Changed

Flow

Cash Flow Engine

↓

Income Cycle

↓

Goal Allocation

↓

Budget Allocation

↓

Remaining Available Income

↓

Budget Utilization

↓

Overspending Detection

↓

Financial Totals

↓

Cash Flow Repository

↓

MongoDB

Outputs

Updated Dashboard

Budget Progress

Goal Progress

Overspending Events

Rules

Only the Cash Flow Engine performs financial calculations.

---

# Flow 9 – Goal Allocation

Trigger

Confirmed Income

Flow

Cash Flow Engine

↓

Load Active Goals

↓

Calculate Allocation

↓

Update Goal Contributions

↓

Goal Repository

↓

MongoDB

Outputs

Updated Goal Progress

Contribution History

---

# Flow 10 – Budget Tracking

Trigger

Expense Transaction

Flow

Expense

↓

Category Engine

↓

Cash Flow Engine

↓

Budget Usage

↓

Threshold Check

↓

Notification Service

↓

Budget Repository

↓

MongoDB

Outputs

Updated Budget

Budget Alerts

---

# Flow 11 – Financial Health Score

Trigger

Cash Flow Updated

Flow

Cash Flow Engine

↓

Financial Health Engine

↓

Savings Rate

↓

Budget Adherence

↓

Income Stability

↓

Spending Consistency

↓

Score Calculation

↓

Frontend

Outputs

Financial Health Score

Recommendations

---

# Flow 12 – Notifications

Trigger

System Event

Events

- Income Confirmed
- Goal Completed
- Budget Warning
- Overspending
- Subscription Due

Flow

Notification Service

↓

Notification Repository

↓

MongoDB

↓

Flutter

Output

Push Notification

In-App Notification

Rules

Notifications never calculate business logic.

---

# Flow 13 – Dashboard Refresh

Trigger

Any Financial Update

Flow

Repository Updated

↓

API Response

↓

Flutter

↓

Refresh

- Dashboard
- Transactions
- Goals
- Budgets
- Financial Health

Rules

Frontend never recalculates backend values.

---

# Event Pipeline

The following event order must always be maintained.

Transaction Imported

↓

Transaction Validated

↓

Transaction Parsed

↓

Merchant Normalized

↓

Category Assigned

↓

Income Matched

↓

Income Confirmed

↓

Cash Flow Updated

↓

Goal Updated

↓

Budget Updated

↓

Financial Health Updated

↓

Notification Created

↓

Frontend Refresh

No stage may bypass this pipeline.

---

# MongoDB Write Points

Only the following stages write to MongoDB:

Authentication Service

↓

Transaction Repository

↓

Income Repository

↓

Cash Flow Repository

↓

Goal Repository

↓

Budget Repository

↓

Notification Repository

No Engine writes directly to MongoDB.

---

# Error Handling Rules

Every stage must:

- Validate inputs.
- Log failures.
- Return structured errors.
- Prevent partial writes.
- Maintain transactional consistency where applicable.

---

# AI Implementation Rules

Before implementing a feature, determine:

1. Which documented flow does this feature belong to?
2. Which Engine owns the business logic?
3. Which Repository writes the data?
4. Which MongoDB collection is affected?
5. Which event is generated?
6. Which frontend screens consume the output?

If the feature does not fit an existing flow, update this document before implementation.

The Data Flow Specification is the authoritative source for all backend processing.