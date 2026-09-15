import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, remove, update, push, query, limitToLast } from "firebase/database";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBNfmxs3iOYOlWdscHj6SX0DP5xxmTCfyU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "full-code-e7288.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://full-code-e7288-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "full-code-e7288",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "full-code-e7288.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "915799491478",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:915799491478:web:7401bc680ffc4a888653b7",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export {
  ref,
  set,
  onValue,
  remove,
  update,
  push,
  query,
  limitToLast,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup
};
