const { db } = require('./firebase-admin');
const { collection, getDocs, doc, setDoc } = require('firebase/firestore');

const restructureData = async () => {
  try {
    const parcelsRef = collection(db, 'parcels');
    const snapshot = await getDocs(parcelsRef);
    
    for (const document of snapshot.docs) {
      const oldData = document.data();
      const newData = {};
      
      // Transform each field
      for (const [key, value] of Object.entries(oldData)) {
        const newKey = key.split('.').pop(); // Get everything after the last dot
        newData[newKey] = value;
      }
      
      // Update the document with new structure
      await setDoc(doc(db, 'parcels', document.id), newData);
      console.log(`Updated document ${document.id}`);
    }
    
    console.log('Data restructuring complete!');
  } catch (error) {
    console.error('Error restructuring data:', error);
  }
};

restructureData();