const { Client, Account, Databases, ID } = require('appwrite');

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6943ba3f0029a6697ddb');

const account = new Account(client);
const databases = new Databases(client);

// Avas DB ID
const dbId = '6944e1910018ac9aad91';
const collId = 'plots';

async function testPropertyCreation() {
    console.log('Authenticating first...');
    try {
        const uniqueEmail = `test_upload_${Date.now()}@example.com`;
        const user = await account.create(ID.unique(), uniqueEmail, 'TestPass123!', 'Test User');
        await account.createEmailPasswordSession(uniqueEmail, 'TestPass123!');
        console.log('✅ Logged in successfully as users role.');

        console.log('\nTesting Exact Plot Submission Payload...');
        const testPayload = {
            title: "Mountain View Plot",
            price: 500000,
            area: 1200,
            location: "Khandala",
            city: "Pune",
            type: "residential",
            propertyType: "Residential Plot",
            status: "For Sale",
            description: "A beautiful test plot.",
            vastu: "East",
            images: [],
            AadharCard: [],
            Extract: [],
            sellerName: "Test Seller",
            owner_name: "Test Seller",
            userId: user.$id,
            owner_id: user.$id,
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

        const newDoc = await databases.createDocument(
            dbId,
            collId,
            ID.unique(),
            testPayload
        );
        console.log('✅ Success! The property was created in the database.');

        console.log('Cleaning up test data...');
        await databases.deleteDocument(dbId, collId, newDoc.$id);

    } catch (error) {
        console.error('❌ Error Details:');
        console.error('Message:', error.message);
        console.error('Type:', error.type);
    }
}

testPropertyCreation();
