import React, { useEffect, useState } from 'react';
import FormComponent from '../FormComponent';
import { useAuth } from '../../contexts/AuthContext';
import { uploadFile } from '../../firebase/firebase';
import { db } from '../../firebase/firebase';

const NewApplicationForm = ({ onBack }) => {
  const { currentUser } = useAuth();
  const [fileMetadata, setFileMetadata] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        if (userDoc.exists) {
          setUserProfile(userDoc.data());
        } else {
          console.log('No user profile found');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    if (currentUser) {
      fetchUserProfile();
    }
  }, [currentUser]);

  useEffect(() => {
    console.log('Setting up MutationObserver...');
    
    // Function to add listeners to file inputs
    const addFileInputListeners = () => {
      const fileInputs = document.querySelectorAll('.fileupload-input');
      console.log('Found file inputs:', fileInputs.length);
      
      fileInputs.forEach(input => {
        // Prevent double-binding by removing any existing listeners
        input.removeEventListener('change', handleFileChange);
        // Add the listener
        input.addEventListener('change', handleFileChange);
        console.log('Added listener to:', input.id);
      });
    };

    // Create a MutationObserver to watch for DOM changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Check if nodes were added
        if (mutation.addedNodes.length) {
          // Look for our file inputs
          const hasFileInputs = Array.from(mutation.addedNodes).some(node => {
            return node.querySelector && node.querySelector('.fileupload-input');
          });
          
          // If we found file inputs, add our listeners
          if (hasFileInputs) {
            console.log('File inputs detected, adding listeners...');
            addFileInputListeners();
          }
        }
      });
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Initial check for existing file inputs
    addFileInputListeners();

    // Cleanup function
    return () => {
      console.log('Cleaning up observer and listeners...');
      observer.disconnect();
      const fileInputs = document.querySelectorAll('.fileupload-input');
      fileInputs.forEach(input => {
        input.removeEventListener('change', handleFileChange);
      });
    };
  }, []); // Empty dependency array since we want this to run once

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    console.log('Starting file upload for:', file.name);

    try {
      const path = `applications/${currentUser.uid}/${Date.now()}_${file.name}`;
      const metadata = await uploadFile(file, path);
      
      setFileMetadata(prevState => ({
        ...prevState,
        [event.target.id]: metadata
      }));
      console.log(`File uploaded successfully:`, metadata);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(`Failed to upload ${file.name}. Please try again.`);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    // Get reference to JotForm's submit button
    const submitButton = document.getElementById('input_2');
    
    const handleSubmit = async (event) => {
      // If files are still uploading, prevent form submission
      if (isUploading) {
        event.preventDefault();
        alert('Please wait for files to finish uploading');
        return;
      }

      // If no files were uploaded, let the form submit normally
      if (Object.keys(fileMetadata).length === 0) {
        return;
      }

      try {
        // Gather form data
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
        
        // Store in Firebase
        const applicationsRef = db.collection('applications');
        await applicationsRef.add({
          ...formData,
          applicantId: currentUser.uid,
          applicantEmail: currentUser.email,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        });

        console.log('Application data saved to Firebase');
        // Let the form continue its normal submission to JotForm
        
      } catch (error) {
        console.error('Error saving application:', error);
        event.preventDefault();
        alert('Error saving application. Please try again.');
      }
    };

    if (submitButton) {
      // Use capture phase to ensure our handler runs before JotForm's
      submitButton.addEventListener('click', handleSubmit, true);
    }

    return () => {
      if (submitButton) {
        submitButton.removeEventListener('click', handleSubmit, true);
      }
    };
  }, [fileMetadata, isUploading, currentUser]);

  return (
    <div className="new-application-container">
      <div className="new-application-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Applications
        </button>
        <h2>New Land Division Application</h2>
      </div>

      <div className="new-application-content">
        <FormComponent 
          autoFillData={userProfile}
        />
      </div>
    </div>
  );
};

export default NewApplicationForm;