const { Client, Databases, ID } = require('appwrite');

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6943ba3f0029a6697ddb');

const databases = new Databases(client);

const dbId = '6944e1910018ac9aad91';
const collId = 'plots';

async function triggerError() {
    try {
        console.log('Attempting payload with badly formatted propertyType...');
        await databases.createDocument(dbId, collId, ID.unique(), {
            title: 'Test',
            price: 1,
            area: 1,
            type: 'Test',
            propertyType: 'BAD_ENUM_VALUE',
            location: 'Test',
        });
    } catch (e) {
        console.error('------- SERVER ERROR RESPONSE -------');
        console.error(e.message);
        console.error('-------------------------------------');
    }
}
triggerError();
