const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');

// Copy your firebase config from your main firebase.js file
const firebaseConfig = {
    apiKey: "AIzaSyAF1rKtyMXJe8qMD3LeUgwxzlknBPNAtBg",
    authDomain: "vbc-land-division-portal.firebaseapp.com",
    projectId: "vbc-land-division-portal",
    storageBucket: "vbc-land-division-portal.firebasestorage.app",
    messagingSenderId: "675208024253",
    appId: "1:675208024253:web:2d38b336f6c76729a8a7d4",
    measurementId: "G-9RZXGWBR4N"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = { db };