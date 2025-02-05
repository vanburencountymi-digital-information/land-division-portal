// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// Initalize Firestore and get a reference to the service
const db = getFirestore(app);

export { db };
