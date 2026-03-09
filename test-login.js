const { Client, Account } = require('appwrite');

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6943ba3f0029a6697ddb');

const account = new Account(client);

async function testLogin() {
    try {
        console.log('Testing login with the user\'s credentials...');
        const session = await account.createEmailPasswordSession('sahilshinde1881@gmail.com', 'Sahil9321');
        console.log('Success! Logged in with session ID:', session.$id);
    } catch (error) {
        console.error('Login Failed:');
        console.error('Message:', error.message);
        console.error('Code:', error.code);
    }
}

testLogin();
