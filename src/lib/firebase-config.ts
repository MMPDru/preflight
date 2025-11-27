import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
    ApiKey: "deleted EXPOSED KEY"
    authDomain: "gen-lang-client-0375513343.firebaseapp.com",
    projectId: "gen-lang-client-0375513343",
    storageBucket: "gen-lang-client-0375513343.firebasestorage.app",
    messagingSenderId: "603100017596",
    appId: "1:603100017596:web:5cf5da1a0bddb92be1b1b9"
};

// Validate configuration
const isConfigValid = Object.values(firebaseConfig).every(
    value => value && value !== 'undefined' && !value.includes('demo-')
);

if (!isConfigValid) {
    console.warn(
        '⚠️ Firebase configuration is missing or using demo values. ' +
        'Please update .env.local with your actual Firebase credentials.'
    );
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable emulators in development (optional - uncomment if using Firebase Emulator Suite)
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
    try {
        connectAuthEmulator(auth, 'http://localhost:9099');
        connectFirestoreEmulator(db, 'localhost', 8080);
        connectStorageEmulator(storage, 'localhost', 9199);
        console.log('🔧 Connected to Firebase Emulators');
    } catch (error) {
        console.log('Emulators already initialized or unavailable');
    }
}

export default app;
