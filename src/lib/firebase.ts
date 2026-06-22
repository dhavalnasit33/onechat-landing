import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB5Xy_Re2JhbcOj31-sOFaegw6bQsxxD3A",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "onechatai.ai",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "onechatai-ai",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "onechatai-ai.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "106785238607",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:106785238607:web:84c2e8c96ca538f1af843a",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-7BV43G56XW",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
