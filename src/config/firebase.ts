import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "AIzaSyDT3H847ElEsu3GPmmZGk0SurE9RFOLsVY",
  authDomain: "itkt-e63e9.firebaseapp.com",
  projectId: "itkt-e63e9",
  storageBucket: "itkt-e63e9.firebasestorage.app",
  messagingSenderId: "130495276553",
  appId: "1:130495276553:web:c418f9c8b71ae3754c7ad8",
  measurementId: "G-GQSNVGSQDX"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;