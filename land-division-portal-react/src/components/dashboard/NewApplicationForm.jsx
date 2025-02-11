import React, { useEffect, useState } from 'react';
import FormComponent from '../FormComponent';
import { useAuth } from '../../contexts/AuthContext';
import { uploadFile } from '../../firebase/firebase';
import { db } from '../../firebase/firebase';

const NewApplicationForm = ({ onBack }) => {
  const { currentUser } = useAuth();
  const [fileMetadata, setFileMetadata] = useState({});

  useEffect(() => {
    // Add change event listeners to all file upload inputs
    const fileInputs = document.querySelectorAll('.fileupload-input');
    fileInputs.forEach(input => {
      input.addEventListener('change', handleFileChange);
    });

    // Cleanup
    return () => {
      fileInputs.forEach(input => {
        input.removeEventListener('change', handleFileChange);
      });
    };
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Create a unique path for the file
      const path = `applications/${currentUser.uid}/${Date.now()}_${file.name}`;
      
      // Upload the file and get metadata
      const metadata = await uploadFile(file, path);
      
      // Store metadata for this input
      setFileMetadata(prevState => ({
        ...prevState,
        [event.target.id]: metadata
      }));

      console.log(`File uploaded successfully:`, metadata);
    } catch (error) {
      console.error("Error uploading file:", error);
      // Here you might want to show an error message to the user
    }
  };

  useEffect(() => {
    // Add an event listener to the submit button
    const submitButton = document.getElementById('input_2');
    if (submitButton) {
      submitButton.addEventListener('click', handleSubmit);
    }

    return () => {
      const submitButton = document.getElementById('input_2');
      if (submitButton) {
        submitButton.removeEventListener('click', handleSubmit);
      }
    };
  }, [fileMetadata]); // Include fileMetadata in dependencies

  const handleSubmit = async (event) => {
    try {
      const formInputs = document.querySelectorAll('input, select, textarea');
      const formData = {};
      formInputs.forEach(input => {
        if (input.id && input.value) {
          const fieldName = input.id.replace('input_', '');
          formData[fieldName] = input.value;
        }
      });

      // Add file metadata to form data
      formData.files = fileMetadata;
      
      // Create the application document with additional metadata
      const applicationsRef = db.collection('applications');
      await applicationsRef.add({
        ...formData,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('Form submitted with data:', formData);
      
      // Wait a brief moment to ensure data is saved
      setTimeout(() => {
        onBack();
      }, 1000);

    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="new-application-container">
      <div className="new-application-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Applications
        </button>
        <h2>New Land Division Application</h2>
      </div>

      <div className="new-application-content">
        <FormComponent />
      </div>
    </div>
  );
};

export default NewApplicationForm;