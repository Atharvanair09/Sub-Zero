# Sub-Zero Database Design

Version: 1.0

Purpose

This document defines the MongoDB database architecture for Sub-Zero.

It specifies:

- Collections
- Field definitions
- Relationships
- Ownership
- Indexes
- Encryption requirements
- Data lifecycle
- Repository ownership

MongoDB is the only persistent datastore.

Every collection and field must be documented before implementation.

---

# Database Principles

Sub-Zero follows these database principles:

- Single Source of Truth
- Privacy First
- Normalize where appropriate
- Avoid duplicate data
- Encrypt sensitive fields
- Store derived values only when performance requires it
- Business logic never lives in the database

---

# Collection Ownership

| Collection | Owner |
|------------|----------------|
| users | Authentication Service |
| transactions | Transaction Repository |
| incomeSources | Income Engine |
| incomeCycles | Cash Flow Engine |
| goals | Goal Service |
| goalAllocations | Cash Flow Engine |
| budgets | Cash Flow Engine |
| notifications | Notification Service |
| gmailSyncState | Gmail Sync Service |
| merchantAliases | Merchant Extraction Engine |
| categoryRules | Category Engine |

Only the owner may write to the collection.

Other services must use APIs or events.

---

# Collection: users

Purpose

Stores user profile and authentication information.

Owner

Authentication Service

Fields

_id

googleId

email

displayName

profilePhoto

createdAt

updatedAt

settings

Security

Email → AES-256 Encrypted

Google ID → AES-256 Encrypted

Indexes

googleId

email

Relationships

One User

↓

Many Transactions

Many Goals

Many Budgets

Many Notifications

---

# Collection: transactions

Purpose

Stores validated financial transactions.

Owner

Transaction Repository

Fields

_id

userId

gmailMessageId

transactionType

amount

merchant

sender

receiver

category

description

referenceNumber

transactionDate

processedAt

confidence

status

Security

Merchant → Encrypted

Sender → Encrypted

Receiver → Encrypted

Description → Encrypted

Reference Number → Encrypted

Indexes

userId

transactionDate

category

transactionType

gmailMessageId

Rules

gmailMessageId must be unique.

Transactions are immutable.

Updates create audit entries.

---

# Collection: incomeSources

Purpose

Recurring income configuration.

Fields

userId

name

expectedAmount

frequency

payer

startDate

status

Rules

Configured once.

Reusable every cycle.

---

# Collection: incomeCycles

Purpose

Stores confirmed monthly income.

Fields

userId

incomeSourceId

month

year

expectedAmount

receivedAmount

status

confirmedTransactionId

Rules

One cycle per income source per month.

---

# Collection: goals

Purpose

Stores savings goals.

Fields

userId

title

targetAmount

targetDate

priority

status

icon

Rules

Goal balance is never stored.

Balance calculated by Cash Flow Engine.

---

# Collection: goalAllocations

Purpose

Tracks monthly goal allocations.

Fields

goalId

incomeCycleId

allocatedAmount

remainingAllocation

month

year

Rules

Virtual allocations only.

---

# Collection: budgets

Purpose

Stores monthly budgets.

Fields

userId

month

year

totalBudget

allocatedBudget

remainingBudget

categories

Rules

Budget values are recalculated.

No manual editing of utilization.

---

# Collection: notifications

Purpose

Stores in-app notifications.

Fields

userId

type

title

message

createdAt

read

priority

Rules

Generated only by Notification Service.

---

# Collection: gmailSyncState

Purpose

Maintains Gmail synchronization state.

Fields

userId

lastHistoryId

lastSyncTime

lastMessageId

status

Rules

Used only for incremental synchronization.

---

# Collection: merchantAliases

Purpose

Maps merchant aliases.

Example

AMZN

↓

Amazon

Fields

alias

canonicalName

confidence

updatedAt

---

# Collection: categoryRules

Purpose

Rule-based transaction categorization.

Fields

merchant

keywords

category

priority

---

# Relationships

User

↓

Transactions

↓

Income Cycles

↓

Cash Flow

↓

Budgets

↓

Goals

↓

Financial Health

---

# Index Strategy

Transactions

- userId
- transactionDate
- category
- gmailMessageId

Income Cycles

- month
- year
- incomeSourceId

Goals

- userId
- status

Budgets

- userId
- month
- year

Notifications

- userId
- createdAt

---

# Encryption Matrix

Encrypted

- Email
- Merchant
- Sender
- Receiver
- Description
- OAuth Tokens
- Gmail IDs

Plain Storage

- Amount
- Category
- Goal Progress
- Budget Values
- Health Score

Hashed

- Passwords

---

# Repository Ownership

Authentication Repository

↓

User Collection

Transaction Repository

↓

Transactions

Income Repository

↓

Income Sources

↓

Income Cycles

Goal Repository

↓

Goals

↓

Goal Allocations

Budget Repository

↓

Budgets

Notification Repository

↓

Notifications

Repositories are the only layer permitted to access MongoDB.

---

# Data Lifecycle

Transaction

Email

↓

Validated

↓

Parsed

↓

Categorized

↓

Income Detection

↓

Cash Flow

↓

Stored

↓

Dashboard

↓

Archived

Goal

Created

↓

Active

↓

Funded

↓

Completed

↓

Archived

Income Cycle

Expected

↓

Detected

↓

Confirmed

↓

Allocated

↓

Closed

---

# Validation Rules

Every write must:

- Validate schema
- Encrypt sensitive fields
- Check ownership
- Verify indexes
- Log the operation
- Update timestamps

No document may be written without validation.

---

# Future Collections

New collections require:

1. Architecture approval
2. Owner assignment
3. Repository assignment
4. Encryption review
5. Index strategy
6. Documentation update

Collections must never be created directly during implementation.

---

# AI Development Rules

Before creating any database field, determine:

- Collection
- Owner
- Data type
- Privacy classification
- Encryption requirement
- Index requirement
- Repository
- Lifecycle

If any of these are unknown, implementation must stop until this document is updated.