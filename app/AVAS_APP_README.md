# Avas Real Estate App Architecture & Guide

Welcome to the **Avas Real Estate** application repository. This document serves as a comprehensive guide to understanding the complete file structure, features, frontend UI architecture, and backend integrations of the Avas platform.

## Overview
Avas is a modern, premium Real Estate application built with **Expo React Native**. It features a glassmorphism design system, AI-powered property insights, advanced geographical searches, and a robust ecosystem for professional services and franchises.

The backend is entirely serverless, powered by **Appwrite** for authentication, database, and storage, and **Google Gemini AI** for intelligent market analysis.

---

## 📂 Project Structure

### 1. `app/` (Expo Router Pages)
This directory acts as the routing backbone. Every `.tsx` file here represents a distinct screen or URL path.

- **`(tabs)/`**: The main authenticated bottom navigation screens.
  - `_layout.tsx`: Configures the Bottom Tab Navigator UI and protects routes using the `AuthContext` (redirects to `/login` if not validated).
  - `index.tsx`: The **Home (Explore)** screen. Displays the hero search, service ecosystem tabs, property feed, and advanced UI filter modals.
  - `search.tsx`: The dedicated **Search & Discovery** screen with an advanced filtering modal and categorical browsing grid.
  - `post.tsx`: Multi-step **Add Listing** form containing a Google Maps dropper, image pickers, and Appwrite upload handlers.
  - `dashboard.tsx`: User role-based statistics (currently under construction).
  - `profile.tsx`: The User Profile screen displaying personal info, active mock settings, and the interactive "My Listings" management section (Edit/Delete).
- **`edit/[id].tsx`**: Dynamic screen allowing users to edit an existing property. Mirrors `post.tsx` but pre-fills data via Appwrite fetching.
- **`property/[id].tsx`**: The dynamic **Property Details** screen. Features image carousels, Google Maps integration, structural details, and the "AI Smart Summary" blocks.
- **`compare.tsx`**: The **AI Comparison** screen. Analyzes two selected properties side-by-side using a dynamically generated Gemini AI breakdown.
- **`chat.tsx`**: The **Avas AI Chatbot**. A conversational interface powered by Gemini to answer user questions about the real estate market.
- **`login.tsx`** & **`signup.tsx`**: The beautifully designed, animated authentication gateways connected to Appwrite Email sessions.
- **`_layout.tsx`** (Root): The top-level root layout. Wraps the entire application in the `<AuthProvider>` and initializes global fonts.

### 2. `src/` (Core Logic & Services)
This directory contains all the underlying business logic, state management, and API connections.

- **`config/env.ts`**: Centralized environment variable management. Exposes Appwrite endpoint, Project ID, Database ID, Collection IDs, and the Google Maps API key.
- **`context/AuthContext.tsx`**: The React Context Provider that tracks the current user's authenticated session, handling login, signup, and logout methods globally.
- **`theme/index.ts`**: The singular source of truth for the app's visual identity. Exports `Colors`, `Typography`, `Spacing`, `Shadows`, and `BorderRadius` constants to ensure perfect UI consistency.
- **`types/index.ts`**: TypeScript definitions spanning the database schema. Contains the `Property` interface and standard arrays like the new lowercase `PROPERTY_TYPES`.
- **`services/appwrite.ts`**: The **Backend Hub**. This file configures the Appwrite Web SDK for React Native. It exports functions for:
  - `auth`: (login, register, logout, getUser)
  - `properties`: (search, getById, getByUser, create, update, delete). Includes custom client-side parsing logic to bypass advanced indexing limits.
  - `images`: (upload, delete, getPreview) utilizing `fetch()` to safely transfer mobile image buffers into Appwrite storage buckets.
- **`services/gemini.ts`**: The **AI Generation Engine**. Initializes `@google/generative-ai` to power the chatbot, property summaries, and side-by-side market comparisons.

### 3. `components/` & `constants/`
- **`components/`**: Reusable isolated UI elements like `FloatingDock`, `ParallaxScrollView`, and themed `ThemedText`/`ThemedView`.
- **`constants/`**: Environment configurations and default styling objects provided by the default Expo template.

### 4. Root Level Files (Node.js Backend Testing)
The root directory contains multiple raw `Node.js` test scripts (`test-*.js`). Because Appwrite is a BaaS (Backend-as-a-Service), there is no traditional Express "Backend API Component" to deploy. These scripts were utilized to test payload formatting and debug Appwrite Server schema restrictions directly via Node.js CLI outside of the React Native environment.

- **`test-appwrite.js`**: Initial connection and data fetching test.
- **`test-login.js` & `test-signup.js`**: Node scripts validating the authentication flow and session creation.
- **`test-upload.js`**: Verified image uploading mechanisms directly to Appwrite storage buckets.
- **`test-payload.js` & `test-payload-auth.js`**: Simulated property creation POST payloads to diagnose database schema errors and test exact JSON structures against Appwrite constraints.
- **`test-schema.js` & `test-enum.js` & `test-typo.js`**: Discovered and bypassed corrupt schema validation errors regarding explicit data types (like `owner_id` requiring an array instead of a string, or misspellings in backend enums).
- **`test-gemini.js`**: Validated the Google AI API key and tested the generative prompt output structure.

---

## 🛠 Technology Stack
- **Framework:** React Native via Expo (TypeScript)
- **Routing:** Expo Router (`app/` directory)
- **Design:** Custom UI with Glassmorphism, built with React Native `StyleSheet` & `LinearGradient`
- **Backend Services:** Appwrite (Database, Auth, Storage)
- **AI Analytics:** Google Gemini (Generative AI API)
- **Mapping:** `react-native-maps` & Google Maps Geocoding API

## 🚀 Running the App
1. Ensure `node` and `npm` are installed.
2. Run `npm install` to download dependencies.
3. Verify your Appwrite cluster is running and your `.env` contains valid endpoints.
4. Run `npx expo start` to launch the Metro Bundler, where you can connect via the Expo Go app or an iOS/Android Simulator.
