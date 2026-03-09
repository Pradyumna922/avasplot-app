const { Client, Account, ID } = require('appwrite');

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6943ba3f0029a6697ddb');

const account = new Account(client);

async function testSignupName() {
    try {
        console.log('Testing name validation...');
        const user = await account.create(
            ID.unique(),
            `test_name_${Date.now()}@example.com`,
            'TestPassword123!',
            'Sahil Nandkumar Shinde' // The exact name the user typed
        );
        console.log('Success! Name "Sahil Nandkumar Shinde" is accepted.');
    } catch (error) {
        console.error('Name Test Failed:');
        console.error('Message:', error.message);
    }
}

testSignupName();
