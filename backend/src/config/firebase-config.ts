// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore";
import dotenv from "dotenv";
dotenv.config();  


const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "careersupport-33838.firebaseapp.com",
  projectId: "careersupport-33838",
  storageBucket: "careersupport-33838.firebasestorage.app",
  messagingSenderId: "303152535810",
  appId: "1:303152535810:web:beb93764a5e562283fca1b",
  measurementId: "G-MCGT2RVL2E"
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const vapidKey = process.env.FIREBASE_VAPID_KEY || "";
