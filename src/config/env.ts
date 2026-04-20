// ============================================================================
// 🔧 AVASPLOT ENVIRONMENT CONFIGURATION
// ============================================================================

// NOTE: Sensitive keys (AI, Payments) should be called from Appwrite Functions
// not directly from the client. EXPO_PUBLIC_ keys are exposed in the app bundle.

export const ENV = {
  appwrite: {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "https://sgp.cloud.appwrite.io/v1",
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "6943ba3f0029a6697ddb",
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || "6944e1910018ac9aad91",
    collections: {
      plots: "plots",
      profiles: "profiles",
      comparisons: "6946334700130e42c991",
      franchises: "franchises",
      subscriptions: "subscriptions",
      scouts: "scouts",
      referrals: "referrals",
      leads: "dashboard_leads",
    },
    buckets: {
      images: "images",
    },
  },
  gemini: {
    // WARNING: Client-side AI calls expose API key. Use Appwrite Functions for production.
    apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY || "",
    model: process.env.EXPO_PUBLIC_GEMINI_MODEL || "gemini-2.0-flash",
  },
  groq: {
    apiKey: process.env.EXPO_PUBLIC_GROQ_API_KEY || "",
    model: "llama-3.3-70b-versatile",
  },
  payu: {
    // WARNING: Payment keys should be used server-side only
    key: process.env.EXPO_PUBLIC_PAYU_KEY || "gtKFFx",
    salt: process.env.EXPO_PUBLIC_PAYU_SALT || "4R38IvwiV57FwVpsgOvTXBdLE4tHUXFW",
    sandbox: process.env.EXPO_PUBLIC_PAYU_SANDBOX !== "false",
  },
  googleMaps: {
    apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  },
  admin: {
    email: "pradyumnashukla08@gmail.com",
  },
  // Feature flags for scaling
  features: {
    enableCaching: process.env.EXPO_PUBLIC_ENABLE_CACHING === "true",
    enableRateLimiting: process.env.EXPO_PUBLIC_ENABLE_RATE_LIMITING === "true",
  },
};
