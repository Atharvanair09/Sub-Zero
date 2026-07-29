# ARCHITECTURE_DECISION_RECORDS.md

Version: 1.0

Purpose

This document records every significant architectural decision made for Sub-Zero.

Each Architecture Decision Record (ADR) captures:

- Context
- Problem
- Decision
- Alternatives Considered
- Consequences
- Status

These records explain why the architecture exists in its current form.

Every future architectural change must be documented by adding a new ADR.

---

# ADR-001

Title

Backend Owns All Business Logic

Status

Accepted

Context

Financial calculations must always remain deterministic and consistent regardless of the frontend platform.

Decision

All business logic resides in the Node.js backend.

Flutter is responsible only for presentation, navigation, local preferences, and API communication.

Consequences

✓ One source of truth

✓ Easier maintenance

✓ Consistent calculations

✓ Multiple frontend platforms become possible

Rejected Alternatives

• Business logic in Flutter

• Shared backend/frontend calculations

---

# ADR-002

Title

MongoDB as Primary Database

Status

Accepted

Context

Sub-Zero stores semi-structured financial data that may evolve over time.

Decision

MongoDB is the only persistent datastore.

Consequences

✓ Flexible schema

✓ Easy scaling

✓ Document-based storage

✓ Faster development

Rejected Alternatives

• Firestore

• PostgreSQL

• MySQL

---

# ADR-003

Title

Privacy-First Architecture

Status

Accepted

Context

Users trust Sub-Zero with highly sensitive financial information.

Decision

Sensitive financial information is encrypted before storage.

Financial data is never sent to external AI services.

Consequences

✓ Improved user privacy

✓ Better compliance

✓ Reduced risk of data leakage

Rejected Alternatives

• Plaintext storage

• AI-based cloud transaction parsing

---

# ADR-004

Title

Deterministic Transaction Parsing

Status

Accepted

Context

Financial data requires predictable extraction.

Decision

Regex, rule-based parsing, merchant alias matching, and deterministic engines are used.

Consequences

✓ Repeatable results

✓ Explainable logic

✓ Offline capable

Rejected Alternatives

• LLM-based parsing

• External AI APIs

---

# ADR-005

Title

Incremental Gmail Synchronization

Status

Accepted

Context

Full mailbox rescans are slow and expensive.

Decision

Use incremental synchronization based on Gmail message identifiers and sync state.

Consequences

✓ Faster synchronization

✓ Lower API usage

✓ Better battery efficiency

Rejected Alternatives

• Full mailbox scan

• Manual refresh only

---

# ADR-006

Title

Single Transaction Processing Pipeline

Status

Accepted

Context

Multiple parsing paths create inconsistent financial data.

Decision

Every transaction follows exactly one processing pipeline.

Gmail

↓

Validation

↓

Parser

↓

Merchant Extraction

↓

Category

↓

Income

↓

Cash Flow

↓

Repository

↓

MongoDB

Consequences

✓ Predictable flow

✓ Easier debugging

✓ No duplicated logic

Rejected Alternatives

Parallel pipelines

---

# ADR-007

Title

Cash Flow Engine Owns Financial Calculations

Status

Accepted

Context

Financial calculations were becoming duplicated across multiple services.

Decision

Cash Flow Engine becomes the only owner of:

• Budget calculations

• Goal allocations

• Available spending

• Monthly reconciliation

• Cash flow summaries

Consequences

✓ Single financial engine

✓ Easier maintenance

✓ No inconsistent balances

Rejected Alternatives

Budget Service calculating budgets

Goal Service calculating allocations

Flutter calculations

---

# ADR-008

Title

Income Sources and Income Cycles are Separate

Status

Accepted

Context

Configured recurring income differs from actual monthly income.

Decision

Income Sources define expected recurring income.

Income Cycles record confirmed monthly income.

Consequences

✓ Handles missed payments

✓ Handles larger-than-expected income

✓ Supports user confirmation

Rejected Alternatives

Single income collection

---

# ADR-009

Title

Virtual Goal Allocation

Status

Accepted

Context

Money allocated to savings goals may later be spent.

Decision

Goals represent virtual allocations instead of actual bank balances.

Consequences

✓ Realistic budgeting

✓ Supports reallocation

✓ Better cash-flow tracking

Rejected Alternatives

Separate wallet per goal

---

# ADR-010

Title

Repository Pattern for Database Access

Status

Accepted

Context

Direct MongoDB access from services leads to tight coupling.

Decision

Repositories are the only components allowed to communicate with MongoDB.

Consequences

✓ Easier testing

✓ Cleaner architecture

✓ Database abstraction

Rejected Alternatives

Services accessing MongoDB directly

---

# ADR-011

Title

Feature-Based Flutter Architecture

Status

Accepted

Context

The application will continue to grow significantly.

Decision

Flutter is organized by feature instead of technical layers.

Consequences

✓ Better scalability

✓ Easier navigation

✓ Reduced coupling

Rejected Alternatives

Screen-based organization

Widget-based organization

---

# ADR-012

Title

Brutalist Design System

Status

Accepted

Context

Most finance apps use similar minimalist designs.

Decision

Sub-Zero adopts a Brutalist design language with strong typography, bold borders, high contrast, and minimal decoration.

Consequences

✓ Strong visual identity

✓ High readability

✓ Distinctive branding

Rejected Alternatives

Material 3 default

Neumorphism

Glassmorphism

---

# ADR-013

Title

Single Dashboard API

Status

Accepted

Context

Loading many APIs on startup increases latency.

Decision

Expose one optimized dashboard endpoint returning all data required for the home screen.

Consequences

✓ Faster loading

✓ Fewer HTTP requests

✓ Better mobile performance

Rejected Alternatives

Multiple API calls during startup

---

# ADR-014

Title

Event-Driven Notifications

Status

Accepted

Context

Notifications should react to business events rather than poll data.

Decision

Notification Service listens to backend events and generates notifications.

Consequences

✓ Loose coupling

✓ Extensible notification system

Rejected Alternatives

Frontend polling

Notification logic inside business services

---

# ADR-015

Title

Documentation-Driven Development

Status

Accepted

Context

Previous AI sessions caused architectural drift due to missing documentation.

Decision

Every architectural change must first update the relevant Markdown documents before implementation.

Consequences

✓ Consistent AI-generated code

✓ Better onboarding

✓ Easier maintenance

Rejected Alternatives

Code-first development

Undocumented architecture changes

---

# ADR Lifecycle

Every new ADR must include:

• Title

• Status

• Context

• Decision

• Alternatives

• Consequences

• Date

• Author

---

# Status Values

Accepted

Proposed

Deprecated

Superseded

Rejected

---

# AI Development Rule

Before suggesting an architectural change, AI must:

1. Check existing ADRs.
2. Verify the proposal does not contradict an accepted decision.
3. If it does, explain the conflict.
4. Propose a new ADR if a change is required.
5. Never silently replace an accepted architectural decision.

---

# Guiding Principle

Architecture evolves through deliberate decisions—not accidental implementation.

Every major change to Sub-Zero must be intentional, documented, and traceable.