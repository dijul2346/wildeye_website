// firebase.js
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBQuatJHTaihZBrpSFtX_05ueBjPOs7Rvg",
    authDomain: "wild-eye-f8551.firebaseapp.com",
    projectId: "wild-eye-f8551",
    storageBucket: "wild-eye-f8551.firebasestorage.app",
    messagingSenderId: "705252671744",
    appId: "1:705252671744:web:b0b6f4eb0b846da995b3e5",
    measurementId: "G-4C7X8VL1C8"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)

// Initialize Firestore
export const db = getFirestore(app)
