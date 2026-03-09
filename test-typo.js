const { Client, Databases, ID } = require('appwrite');

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6943ba3f0029a6697ddb');

const databases = new Databases(client);
const dbId = '6944e1910018ac9aad91';
const collId = 'plots';

async function testTypo() {
    // We try to create a document with the suspected exact typos
    const attempts = [
        "residential",
        "residential ",
        "commercial agricultural industrail",
        "commercial",
        "industrial",
    ];

    for (const val of attempts) {
        try {
            console.log(`Trying propertyType: '${val}'...`);
            const doc = await databases.createDocument(dbId, collId, ID.unique(), {
                title: 'Test', price: 1, area: 1, type: 'Test', location: 'Test',
                propertyType: val
            });
            console.log(`SUCCESS with '${val}' (Doc ID: ${doc.$id})`);
            // Clean up
            await databases.deleteDocument(dbId, collId, doc.$id);
        } catch (e) {
            console.log(`FAILED with '${val}': ${e.message}`);
        }
    }
}
testTypo();
