const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Create test user
async function createTestUser() {
    try {
        const userRecord = await admin.auth().createUser({
            email: 'test@preflight.com',
            password: 'Test123456',
            displayName: 'Test User'
        });

        console.log('Successfully created user:', userRecord.uid);

        // Create user document in Firestore
        await admin.firestore().collection('users').doc(userRecord.uid).set({
            uid: userRecord.uid,
            email: 'test@preflight.com',
            displayName: 'Test User',
            role: 'admin',
            photoURL: null,
            createdAt: admin.firestore.Timestamp.now(),
            lastLogin: admin.firestore.Timestamp.now(),
            preferences: {
                theme: 'dark',
                notifications: true
            }
        });

        console.log('User document created in Firestore');
        console.log('\nTest credentials:');
        console.log('Email: test@preflight.com');
        console.log('Password: Test123456');

    } catch (error) {
        console.error('Error creating user:', error);
    }

    process.exit(0);
}

createTestUser();
