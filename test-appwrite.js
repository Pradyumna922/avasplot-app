const { Client, Databases, ID } = require('appwrite');

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6943ba3f0029a6697ddb');

const databases = new Databases(client);

// Avas DB ID
const dbId = '6944e1910018ac9aad91';
const collId = 'plots';

async function testConnection() {
    try {
        console.log('Fetching properties...');
        const response = await databases.listDocuments(
            dbId,
            collId
        );
        console.log('Success! Properties found:', response.total);
        if (response.total > 0) {
            console.log('Schema sample (keys):', Object.keys(response.documents[0] || {}));
        }

        console.log('\nAttempting to create a test property...');
        const newDoc = await databases.createDocument(
            dbId,
            collId,
            ID.unique(),
            {
                title: 'Test Property Script',
                price: 1000,
                area: 1000,
                type: 'residential',
                location: 'Test Location',
                verified: false,
                views: 0,
                favorites: 0
            }
        );
        console.log('Successfully created test property:', newDoc.$id);

        // Clean up
        await databases.deleteDocument(dbId, collId, newDoc.$id);
        console.log('Cleaned up test property.');

    } catch (error) {
        console.error('Appwrite Error Details:');
        console.error('Message:', error.message);
        console.error('Type:', error.type);
        console.error('Code:', error.code);
    }
}

testConnection();
