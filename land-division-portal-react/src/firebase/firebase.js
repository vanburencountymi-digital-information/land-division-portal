// firebase.js using compat libraries
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/storage";

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

// Initialize Firestore, Auth and Storage
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// Function to handle file upload
const uploadFile = async (file, path) => {
  try {
    console.log('Starting upload for file:', file.name, 'to path:', path);
    const storageRef = storage.ref(path);

    console.log('Uploading file...');
    const snapshot = await storageRef.put(file);

    console.log('Getting download URL...');
    const downloadURL = await snapshot.ref.getDownloadURL();

    const metadata = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      uploadTimestamp: new Date().toISOString(),
      downloadURL: downloadURL,
      path: path
    };
    console.log('Upload complete, metadata:', metadata);
    return metadata;
  } catch (error) {
    console.error("Error uploading file:", error.message, error.code);
    throw error;
  }
};

// Function to handle multiple file uploads
const uploadFiles = async (files, basePath) => {
  try {
    const uploadPromises = Array.from(files).map(async (file) => {
      const path = `${basePath}/${file.name}`;
      return await uploadFile(file, path);
    });

    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error("Error uploading files:", error);
    throw error;
  }
};

export { app, db, auth, storage, uploadFile, uploadFiles };