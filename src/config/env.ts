// ============================================================================
// 🔧 AVASPLOT ENVIRONMENT CONFIGURATION
// ============================================================================

export const ENV = {
  appwrite: {
    endpoint: 'https://sgp.cloud.appwrite.io/v1',
    projectId: '6943ba3f0029a6697ddb',
    databaseId: '6944e1910018ac9aad91',
    collections: {
      plots: 'plots',
      profiles: 'profiles',
      comparisons: '6946334700130e42c991',
      franchises: 'franchises',
      subscriptions: 'subscriptions',
      scouts: 'scouts',
      referrals: 'referrals',
      leads: 'dashboard_leads',
    },
    buckets: {
      images: 'images',
    },
  },
  gemini: {
    apiKey: 'AIzaSyDLB6yhhq1zWlKdzLVbAvUbUIJh66cs5g4',
    model: 'gemini-1.5-flash',
  },
  razorpay: {
    keyId: 'rzp_test_YOUR_KEY_HERE', // Replace with your Razorpay Test/Live Key ID
  },
  googleMaps: {
    apiKey: 'AIzaSyDh_nsaHVRivjzobvQY_PoedXVom7wHv5U',
  },
  admin: {
    email: 'pradyumnashukla08@gmail.com',
  },
};
