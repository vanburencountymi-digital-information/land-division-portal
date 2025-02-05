// firebase.js using compat libraries
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAF1rKtyMXJe8qMD3LeUgwxzlknBPNAtBg",
  authDomain: "vbc-land-division-portal.firebaseapp.com",
  projectId: "vbc-land-division-portal",
  storageBucket: "vbc-land-division-portal.firebasestorage.app",
  messagingSenderId: "675208024253",
  appId: "1:675208024253:web:2d38b336f6c76729a8a7d4",
  measurementId: "G-9RZXGWBR4N"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Initialize Firestore and Auth
const db = firebase.firestore();
const auth = firebase.auth();

export { app, db, auth };
