import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    "projectId": "studio-5599196302-bf226",
    "appId": "1:198447359643:web:ac1d8dba1a021587a7483e",
    "storageBucket": "studio-5599196302-bf226.appspot.com",
    "apiKey": "AIzaSyAbRSCFDBavBPFK5ZvcXAwYRgP-QDtrIfA",
    "authDomain": "studio-5599196302-bf226.firebaseapp.com",
    "messagingSenderId": "198447359643"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
