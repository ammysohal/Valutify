'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    // When deployed to App Hosting, the config is provided automatically.
    // In other environments, we'll fall back to the config object.
    // This is also important for the Next.js build process.
    if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
        try {
            const app = initializeApp();
            return getSdks(app);
        } catch (e) {
             // If auto-init fails, fall back to config object.
             console.warn("Automatic Firebase initialization failed, falling back to config object.", e);
             const app = initializeApp(firebaseConfig);
             return getSdks(app);
        }
    } else {
        // This path is for local development and other hosting providers like Netlify
        const app = initializeApp(firebaseConfig);
        return getSdks(app);
    }
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
