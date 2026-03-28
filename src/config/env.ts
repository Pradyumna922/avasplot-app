// ============================================================================
// 🔧 AVASPLOT ENVIRONMENT CONFIGURATION
// ============================================================================

export const ENV = {
  appwrite: {
    endpoint: "https://sgp.cloud.appwrite.io/v1",
    projectId: "6943ba3f0029a6697ddb",
    databaseId: "6944e1910018ac9aad91",
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
    apiKey: "AIzaSyBBanKc5v9t4jXoUUxbR-dRL2OlFAZDViw",
    model: "gemini-2.0-flash",
  },
  groq: {
    apiKey: process.env.EXPO_PUBLIC_GROQ_API_KEY || "MISSING_KEY",
    model: "llama-3.3-70b-versatile",
  },
  payu: {
    key: "gtKFFx", // PayU Test Key
    salt: "4R38IvwiV57FwVpsgOvTXBdLE4tHUXFW", // Standard PayU Test Salt
    sandbox: true,
  },
  googleMaps: {
    apiKey: "AIzaSyDh_nsaHVRivjzobvQY_PoedXVom7wHv5U",
  },
  admin: {
    email: "pradyumnashukla08@gmail.com",
  },
};
