const { Client, Databases } = require('appwrite');

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6943ba3f0029a6697ddb');

const databases = new Databases(client);

const dbId = '6944e1910018ac9aad91';
const collId = 'plots';

async function checkSchema() {
    try {
        console.log('Fetching collection config...');
        const coll = await databases.getCollection(dbId, collId);

        const typeAttr = coll.attributes.find(a => a.key === 'propertyType');
        console.log('\npropertyType Attribute Rules:');
        console.log(JSON.stringify(typeAttr, null, 2));

        const typeAttr2 = coll.attributes.find(a => a.key === 'type');
        console.log('\ntype Attribute Rules:');
        console.log(JSON.stringify(typeAttr2, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
    }
}
checkSchema();
