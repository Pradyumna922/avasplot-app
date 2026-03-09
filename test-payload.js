const { Client, Databases, ID } = require('appwrite');

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6943ba3f0029a6697ddb');

const databases = new Databases(client);

// Avas DB ID
const dbId = '6944e1910018ac9aad91';
const collId = 'plots';

async function testPropertyCreation() {
    console.log('Testing Exact Plot Submission Payload...');

    // Exact payload mirroring post.tsx line 163
    const testPayload = {
        title: "Mountain View Plot",
        price: 500000,
        area: 1200,          // Float in app
        location: "Khandala",
        city: "Pune",
        type: "residential",
        propertyType: "Residential Plot",
        status: "For Sale",
        description: "A beautiful test plot.",
        vastu: "East",
        images: [],          // Empty array for test
        AadharCard: [],      // Empty array for test
        Extract: [],         // Empty array for test
        sellerName: "Test Seller",
        owner_name: "Test Seller",
        userId: "testId123",
        owner_id: "testId123",
        email: "test@example.com",
        mobile: "9999999999",
        verified: false,
        views: 0,
        favorites: 0,
        landmark: "",
        state: "",
        pincode: "",
        amenities: [],
        PinLocation: ""
    };

    try {
        const newDoc = await databases.createDocument(
            dbId,
            collId,
            ID.unique(),
            testPayload
        );
        console.log('✅ Success! The payload structure is valid.');
        console.log('Deleting test document...');
        await databases.deleteDocument(dbId, collId, newDoc.$id);
    } catch (error) {
        console.error('❌ Validation Error Details:');
        console.error('Message:', error.message);
        console.error('Type:', error.type);
    }
}

testPropertyCreation();
