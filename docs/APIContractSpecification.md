# API_CONTRACT_SPECIFICATION.md

Version: 1.0

Purpose

This document defines every public REST API exposed by the Sub-Zero backend.

It is the contract between the Flutter application and the Node.js backend.

Controllers expose APIs.

Services perform orchestration.

Engines execute business logic.

Repositories communicate with MongoDB.

Flutter communicates only through documented APIs.

---

# API Principles

Sub-Zero follows the following API principles.

• RESTful architecture

• Stateless requests

• JWT Authentication

• JSON only

• HTTPS only

• Versioned APIs

• Consistent response format

• No business logic in Flutter

---

# Base URL

/api/v1

---

# Standard Response Format

Success

```json
{
  "success": true,
  "message": "Operation completed.",
  "data": {},
  "timestamp": "2026-07-25T12:00:00Z"
}
```

Failure

```json
{
  "success": false,
  "message": "Income source not found.",
  "errorCode": "INCOME_SOURCE_NOT_FOUND",
  "timestamp": "2026-07-25T12:00:00Z"
}
```

---

# Authentication

Every protected endpoint requires

Authorization

Bearer <JWT Token>

Public endpoints

POST /auth/google

Health Check

---

# Authentication APIs

## POST /auth/google

Purpose

Google Sign-In

Request

Google ID Token

Response

JWT

User Profile

---

## POST /auth/logout

Purpose

Invalidate session.

---

## GET /auth/me

Purpose

Return authenticated user.

---

# Gmail APIs

## POST /gmail/connect

Purpose

Connect Gmail account.

---

## POST /gmail/disconnect

Purpose

Disconnect Gmail.

---

## POST /gmail/sync

Purpose

Perform incremental synchronization.

Returns

New Transactions

Sync Summary

Rules

Never rescans the full mailbox.

---

## GET /gmail/status

Returns

Connection state

Last Sync

History ID

---

# Transaction APIs

## GET /transactions

Purpose

Retrieve transactions.

Supports

Pagination

Sorting

Filtering

Search

Parameters

page

limit

category

merchant

type

month

year

search

---

## GET /transactions/:id

Return single transaction.

---

## GET /transactions/summary

Returns

Income

Expenses

Net Cash Flow

Budget Usage

---

# Income APIs

## GET /income/sources

Return configured income sources.

---

## POST /income/sources

Create income source.

---

## PATCH /income/sources/:id

Update income source.

---

## DELETE /income/sources/:id

Delete income source.

---

## GET /income/cycles

Return monthly income cycles.

---

## POST /income/confirm

Confirm detected income.

---

# Budget APIs

## GET /budgets

Return

Monthly budget

Category budgets

Utilization

Remaining amount

---

## POST /budgets

Create budget.

---

## PATCH /budgets/:id

Update budget.

---

## DELETE /budgets/:id

Delete budget.

---

# Goal APIs

## GET /goals

Return all goals.

---

## POST /goals

Create goal.

---

## PATCH /goals/:id

Update goal.

---

## DELETE /goals/:id

Delete goal.

---

## GET /goals/progress

Returns

Contribution history

Progress

Remaining target

---

# Financial Health APIs

## GET /financial-health

Returns

Score

Breakdown

Recommendations

Trend

---

# Insight APIs

## GET /insights

Returns

Monthly insights

Spending trends

Category breakdown

Income analysis

Goal analytics

Budget analytics

---

# Notification APIs

## GET /notifications

Returns

Unread notifications

Read notifications

---

## PATCH /notifications/:id/read

Mark notification as read.

---

## DELETE /notifications/:id

Delete notification.

---

# Dashboard APIs

## GET /dashboard

Returns

Current Balance

Income

Expenses

Cash Flow

Goals

Budgets

Financial Health

Recent Transactions

Notifications

Upcoming Bills

This endpoint is optimized to reduce multiple frontend API calls.

---

# Search APIs

## GET /search

Supports

Merchant

Category

Goal

Budget

Income Source

Transaction

---

# Filter Parameters

Transactions

category

merchant

type

dateRange

minAmount

maxAmount

paymentMethod

Budget

month

year

Goal

status

priority

Notifications

read

priority

type

---

# Pagination

Supported by

Transactions

Notifications

Insights

Request

page

limit

Response

currentPage

totalPages

totalRecords

hasNext

hasPrevious

---

# HTTP Status Codes

200

Success

201

Created

204

Deleted

400

Validation Error

401

Unauthorized

403

Forbidden

404

Not Found

409

Conflict

422

Business Rule Failure

429

Rate Limited

500

Internal Error

---

# Error Codes

AUTH_INVALID_TOKEN

AUTH_EXPIRED_TOKEN

GMAIL_NOT_CONNECTED

TRANSACTION_NOT_FOUND

INCOME_ALREADY_CONFIRMED

BUDGET_EXCEEDED

GOAL_NOT_FOUND

VALIDATION_FAILED

SYNC_FAILED

---

# Security Rules

All endpoints require HTTPS.

JWT validation occurs before controller execution.

Sensitive fields must never be returned.

Encrypted fields are decrypted only when necessary.

No OAuth tokens are exposed.

---

# Versioning

Current Version

v1

Breaking changes require

/api/v2

---

# Rate Limiting

Authentication

10 requests/minute

Synchronization

1 request/2 minutes

Search

60 requests/minute

Dashboard

30 requests/minute

---

# Logging

Every request logs

Request ID

User ID

Endpoint

Duration

Status

Timestamp

Sensitive information is never logged.

---

# API Ownership

| Endpoint Group | Owner |
|----------------|--------------------|
| Authentication | Authentication Service |
| Gmail | Gmail Sync Service |
| Transactions | Transaction Service |
| Income | Income Engine |
| Budgets | Cash Flow Engine |
| Goals | Goal Service |
| Financial Health | Financial Health Engine |
| Insights | Insight Engine |
| Notifications | Notification Service |

---

# Future Endpoint Rules

Before introducing any endpoint:

1. Verify that no existing endpoint satisfies the requirement.

2. Assign an owner.

3. Document request schema.

4. Document response schema.

5. Document authentication requirements.

6. Document rate limits.

7. Update the API contract before implementation.

No undocumented endpoint may be added to the backend.