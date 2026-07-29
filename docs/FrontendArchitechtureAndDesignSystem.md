# FRONTEND_ARCHITECTURE_AND_DESIGN_SYSTEM.md

Version: 1.0

Purpose

This document defines the architecture, folder structure, state management, navigation, design system, and UI principles for the Sub-Zero Flutter application.

It serves as the single source of truth for all frontend development.

Every screen, widget, service, and feature must comply with this document.

---

# Frontend Philosophy

Sub-Zero follows these principles:

• Clean Architecture

• Feature-first organization

• Brutalist Design System

• Reusable Components

• Offline-first where appropriate

• Stateless UI

• Backend owns business logic

• Flutter owns presentation

---

# Responsibilities

Flutter IS responsible for:

• UI Rendering

• User Interaction

• Navigation

• Form Validation

• API Communication

• Local Theme

• Secure Token Storage

• Cached API Responses

Flutter is NOT responsible for:

• Financial calculations

• Budget calculations

• Goal calculations

• Income matching

• Category classification

• Transaction parsing

• Gmail synchronization logic

These belong to the backend.

---

# Application Layers

Presentation Layer

↓

State Management Layer

↓

Service Layer

↓

Repository Layer

↓

REST API

↓

Node.js Backend

---

# Folder Structure

/lib

/core
    constants/
    themes/
    routing/
    utils/
    widgets/
    services/
    models/

features/

    authentication/
    dashboard/
    transactions/
    budgets/
    goals/
    income/
    insights/
    notifications/
    settings/
    onboarding/

Each feature contains

presentation/

widgets/

controllers/

models/

repositories/

services/

No feature may directly depend on another feature.

Shared functionality belongs in /core.

---

# State Management

State Management

Riverpod

Responsibilities

Riverpod Providers

↓

API Calls

↓

UI Updates

Rules

Business logic must not be duplicated inside Providers.

Providers only manage UI state.

---

# Navigation

Navigation uses

GoRouter

Navigation Flow

Splash

↓

Authentication

↓

Dashboard

↓

Transactions

↓

Budgets

↓

Goals

↓

Insights

↓

Settings

Deep links should be supported.

---

# Screen Architecture

Every screen follows

Screen

↓

Controller

↓

Provider

↓

Repository

↓

API

↓

Backend

Screens never call APIs directly.

---

# Design System

Style

Brutalist

Characteristics

• High contrast

• Thick borders

• Large typography

• Flat colors

• Minimal gradients

• Sharp corners

• Strong shadows

• Functional over decorative

The interface should appear bold, structured, and modern while remaining highly usable.

---

# Color Palette

Primary

Black

White

Accent

Electric Blue

Success

Green

Warning

Orange

Error

Red

Background

Light Gray

No glassmorphism.

No neumorphism.

Minimal animations.

---

# Typography

Headings

Large

Bold

Uppercase where appropriate

Body

Readable

High contrast

Numbers

Monospaced where useful

Financial values should always align properly.

---

# Icons

Icons should be simple.

Prefer

Material Symbols

Lucide Icons

No 3D icons.

No skeuomorphic icons.

---

# Cards

Every card should contain

Title

Primary Value

Supporting Information

Action

Cards use

Thick borders

No rounded corners beyond 8px

Subtle elevation only

---

# Buttons

Primary

Filled

Secondary

Outlined

Danger

Red Border

Icon Buttons

Square

Consistent spacing

---

# Input Fields

Outlined

High Contrast

Large Labels

Clear Error Messages

Always support keyboard navigation.

---

# Lists

Transactions

Infinite Scroll

Goals

Lazy Loaded

Notifications

Pagination

Always avoid loading unnecessary data.

---

# Loading States

Every screen requires

Loading

Empty

Success

Error

Offline

Skeleton loaders preferred.

---

# Offline Strategy

Cache

Dashboard

Transactions

Goals

Budgets

Do not cache

OAuth Tokens

Sensitive calculations

Income matching

Financial health calculations

---

# Security

Tokens stored using

Flutter Secure Storage

Never use SharedPreferences for

JWT

OAuth Tokens

Sensitive financial information

---

# API Communication

Only Repository classes communicate with APIs.

UI

↓

Repository

↓

API Service

↓

Backend

No widget performs HTTP requests directly.

---

# Reusable Components

Create reusable widgets for

Transaction Card

Budget Card

Goal Card

Financial Score Card

Income Card

Notification Tile

Search Bar

Filter Sheet

Confirmation Dialog

Bottom Navigation

These should never be duplicated.

---

# Animations

Animation philosophy

Fast

Purposeful

Minimal

Recommended

Fade

Scale

Slide

Micro interactions

Avoid

Heavy transitions

Long animations

Distracting motion

---

# Accessibility

Support

Dynamic text scaling

High contrast

Screen readers

Large touch targets

Semantic labels

Keyboard navigation

---

# Responsive Design

Support

Phones

Tablets

Foldables

Landscape

Portrait

Avoid fixed dimensions.

Use flexible layouts.

---

# Error Handling

Every screen must support

Loading

Error

Retry

Offline

Validation Errors

Authentication Expired

---

# Performance Rules

Lazy load large lists.

Use pagination.

Minimize rebuilds.

Use const widgets whenever possible.

Dispose controllers properly.

Optimize image loading.

---

# Widget Naming Convention

FeatureNameScreen

FeatureNameCard

FeatureNameTile

FeatureNameDialog

FeatureNameBottomSheet

FeatureNameProvider

FeatureNameRepository

Maintain consistent naming.

---

# AI Development Rules

Before implementing a new frontend feature:

1. Does a similar widget already exist?
2. Does it belong to an existing feature module?
3. Does it require a new provider?
4. Does it require a new repository?
5. Does it follow the Brutalist Design System?
6. Does it communicate only through documented APIs?
7. Does it duplicate business logic from the backend?
8. Is it responsive?
9. Is it accessible?

If any answer is "No", implementation must stop until the architecture is updated.

---

# Future UI Components

Every new screen must define:

• Purpose

• Entry Route

• Required APIs

• Required Providers

• Reusable Widgets

• Loading State

• Error State

• Offline Behaviour

• Navigation Path

• Accessibility Requirements

No screen may be added without documentation.

---

# Guiding Principle

The frontend exists to present financial information clearly, securely, and consistently.

The backend owns correctness.

The frontend owns experience.

Every new feature must strengthen—not complicate—the user experience.