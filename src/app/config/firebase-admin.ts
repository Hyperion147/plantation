import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
};

// Initialize Firebase Admin if not already initialized
const apps = getApps();
const firebaseAdmin = apps.length === 0 ? initializeApp(firebaseAdminConfig) : apps[0];

export const auth = getAuth(firebaseAdmin);
