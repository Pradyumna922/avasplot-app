# 🔒 AVASPLOT Security & Scaling Guide

## Overview

This document describes the security and scalability features implemented in the AVASPLOT application.

---

## ✅ Implemented Security Features

### 1. Environment-Based Configuration

**Files:** `src/config/env.ts`, `.env.example`

**What it does:**
- API keys are now read from environment variables
- Prevents hardcoded secrets from being exposed in app bundle

**Setup:**
```bash
# Create .env file from example
cp .env.example .env

# Add your API keys
EXPO_PUBLIC_GEMINI_API_KEY=your-key-here
EXPO_PUBLIC_GROQ_API_KEY=your-key-here
EXPO_PUBLIC_PAYU_KEY=your-key-here
EXPO_PUBLIC_PAYU_SALT=your-salt-here
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-key-here
```

**Important:** For production, sensitive operations (AI, Payments) should be moved to server-side.

---

### 2. Input Validation

**File:** `src/utils/validation.ts`

**What it does:**
- Validates all user inputs before sending to backend
- Prevents crashes from malformed data
- Sanitizes inputs (trims whitespace, converts to lowercase)

**Usage:**

```typescript
import { propertySchema, safeValidate, validateOrThrow } from "../utils/validation";

// Option 1: Safe validation (returns result object)
const result = safeValidate(propertySchema, userInput);
if (!result.success) {
  console.log("Validation errors:", result.errors);
  return;
}
// Use result.data (safely validated)

// Option 2: Throw on error
const validated = validateOrThrow(propertySchema, userInput);
// Use validated (guaranteed valid)
```

**Schemas available:**
- `propertySchema` - Property creation/update
- `leadSchema` - Lead submission
- `loginSchema` - Login validation
- `signupSchema` - Signup validation
- `searchSchema` - Search parameters

---

### 3. Rate Limiting

**File:** `src/utils/rateLimit.ts`

**What it does:**
- Client-side rate limiting to prevent API spam
- Prevents accidental spam from user actions
- Visual feedback when rate limited

**Usage:**

```typescript
import { rateLimiter, rateGuarded, limits } from "../utils/rateLimit";

// Check manually
const allowed = rateLimiter.check("search", 30, 60000);
if (!allowed) {
  // Show message to user
  return;
}

// Guard a function
function submitLead() {
  rateGuarded("leadCreate", limits.leadCreate, "submit leads");
  // ... proceed
}

// Clear on logout
rateLimiter.clearAll();
```

**Default Limits:**
| Action | Limit | Window |
|--------|-------|--------|
| Search | 30 | 1 minute |
| Property Create | 10 | 1 minute |
| Lead Create | 20 | 1 minute |
| Login | 5 | 1 minute |
| Image Upload | 5 | 1 minute |

---

### 4. Error Handling

**File:** `src/utils/errorHandler.ts`

**What it does:**
- Catches and transforms errors to user-friendly messages
- Prevents app crashes from unhandled errors
- Logs errors for debugging

**Usage:**

```typescript
import { safeAsync, handleAppwriteError, AppError } from "../utils/errorHandler";

// Safe async execution
const user = await safeAsync(
  () => auth.getUser(),
  { showError: true } // Show error to user
);

// Handle specific errors
try {
  await someOperation();
} catch (error) {
  const appError = handleAppwriteError(error);
  if (appError instanceof AuthError) {
    router.push("/login");
  }
}
```

---

### 5. Cloudflare Rate Limiting (Free Tier)

**File:** `cloudflare/worker-rate-limit.ts`

**What it does:**
- Server-side rate limiting at the edge
- Protects your API from external attacks
- Works with Cloudflare's free tier

**Setup:**

```bash
# 1. Install wrangler CLI
npm install -g wrangler

# 2. Login to Cloudflare
wrangler login

# 3. Create KV namespace for rate limiting
wrangler kv:namespace create RATE_LIMIT_KV

# 4. Update wrangler.toml with the KV ID
# (the ID will be shown after creation)

# 5. Deploy
wrangler deploy
```

**Then configure your domain:**
1. Go to Cloudflare Dashboard
2. Select your domain
3. Go to Workers & Pages
4. Add route: `your-domain.com/*`
5. Deploy the worker

---

## 🚀 Scaling Checklist

### Current Limitations

| Component | Current Limit | Notes |
|-----------|--------------|-------|
| Appwrite Cloud | ~50K users | Paid tiers scale higher |
| No caching | N/A | Add Redis for production |
| Single region | Singapore | Add failover for 1M+ users |

### Before 1,000 Users

- [ ] Set up Cloudflare (free)
- [ ] Configure rate limiting
- [ ] Add error boundaries
- [ ] Monitor with free tools (Sentry, LogRocket)

### Before 10,000 Users

- [ ] Move AI/Payment calls to Appwrite Functions
- [ ] Add Redis caching
- [ ] Set up monitoring alerts
- [ ] Consider dedicated Appwrite tier

### Before 100,000 Users

- [ ] Multi-region database
- [ ] CDN for images
- [ ] Load testing
- [ ] Security audit

### Before 1,000,000 Users

- [ ] Dedicated infrastructure
- [ ] Multi-region failover
- [ ] Professional penetration testing
- [ ] Compliance (GDPR, etc.)

---

## 🔐 Security Best Practices

### 1. Never expose API keys in client code

```typescript
// ❌ BAD - Key exposed in bundle
const apiKey = "AIzaSy...";

// ✅ GOOD - Use Appwrite Functions
// Client calls /functions/ai-completion
// Function calls Gemini with key from env
```

### 2. Validate all inputs

```typescript
// ❌ BAD - Direct usage
await properties.create(userInput);

// ✅ GOOD - Validate first
const validated = validateOrThrow(propertySchema, userInput);
await properties.create(validated);
```

### 3. Handle errors gracefully

```typescript
// ❌ BAD - Let errors crash app
const data = await fetchData();

// ✅ GOOD - Handle errors
const data = await safeAsync(fetchData);
if (!data) return <ErrorView />;
```

### 4. Rate limit all operations

```typescript
// ❌ BAD - No protection
await submitForm(data);

// ✅ GOOD - Rate limited
rateGuarded("leadCreate", limits.leadCreate);
await submitForm(data);
```

---

## 📞 Getting Help

- **Appwrite Docs:** https://appwrite.io/docs
- **Expo Security:** https://docs.expo.dev/guides/security/
- **Cloudflare Workers:** https://developers.cloudflare.com/workers/

---

## ⚡ Quick Setup

Run these commands to enable all security features:

```bash
# 1. Install dependencies
cd avasplot-app
npm install

# 2. Create .env file
cp .env.example .env
# Edit .env with your API keys

# 3. Set up Cloudflare (optional, for rate limiting)
# See "Cloudflare Rate Limiting" section above
```

---

## 📝 Changelog

- **2024-01-01:** Initial security setup
  - Environment-based configuration
  - Input validation with Zod
  - Client-side rate limiting
  - Error handling utilities
  - Cloudflare Worker for server-side rate limiting