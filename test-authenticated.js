const { Client, Account, Databases, ID, Permission, Role } = require('appwrite');

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6943ba3f0029a6697ddb');

const account = new Account(client);
const databases = new Databases(client);

const dbId = '6944e1910018ac9aad91';
const collId = 'plots';

async function testSubmit() {
    try {
        console.log('Logging in...');
        const user = await account.createEmailPasswordSession('sahilshinde1881@gmail.com', 'Sahil9321');
        console.log('Logged in as', user.userId);

        console.log('Attempting to create a property with type: \'industrial\'...');
        const data = {
            title: "Test Plot",
            price: 1000,
            area: 500,
            location: "Andheri",
            city: "Mumbai",
            type: "Industrial Plot",
            propertyType: "industrial",
            status: "For Sale",
            description: "Test description",
            vastu: "North",
            images: [],
            AadharCard: [],
            Extract: [],
            sellerName: "Sahil",
            owner_name: "Sahil",
            userId: user.userId,
            owner_id: user.userId,
            email: "sahilshinde1881@gmail.com",
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

        const doc = await databases.createDocument(
            dbId,
            collId,
            ID.unique(),
            data,
            [
                Permission.read(Role.any()),
                Permission.update(Role.user(user.userId)),
                Permission.delete(Role.user(user.userId)),
            ]
        );
        console.log('SUCCESS! Document created:', doc.$id);

        await databases.deleteDocument(dbId, collId, doc.$id);
        console.log('Deleted test document cleanly.');
    } catch (e) {
        console.log('\n--- ERROR DETAILS ---');
        console.log('MESSAGE:', e.message);
        console.log('CODE:', e.code);
        console.log('RESPONSE:', e.response);
    }
}
testSubmit();
