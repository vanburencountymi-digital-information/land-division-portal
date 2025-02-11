import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/firebase';
import ProfileForm from './ProfileForm'; // your JotForm-based component
import '../styles/Profile.css';

const Profile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = React.useState(null);
  const [isEditing, setIsEditing] = React.useState(false);

  useEffect(() => {
    // Fetch user profile data when component mounts
    const fetchProfileData = async () => {
      try {
        const docRef = await db.collection('users').doc(currentUser.uid).get();
        if (docRef.exists) {
          setProfileData(docRef.data());
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfileData();
  }, [currentUser.uid]);

  useEffect(() => {
    // Only add form listeners if we're in editing mode or no profile exists
    if (isEditing || !profileData) {
      const submitButton = document.getElementById('input_2');
      if (submitButton) {
        submitButton.addEventListener('click', handleFirestoreSubmit);
      }

      return () => {
        const submitButton = document.getElementById('input_2');
        if (submitButton) {
          submitButton.removeEventListener('click', handleFirestoreSubmit);
        }
      };
    }
  }, [isEditing, profileData]);

  const handleFirestoreSubmit = async (event) => {
    event.preventDefault();     // Prevents the default form submission
    event.stopPropagation();   // Stops the event from bubbling up to other handlers
    try {
      // Get all form inputs
      const formData = {};
      const formInputs = document.querySelectorAll('input, select, textarea');
      formInputs.forEach(input => {
        if (input.id && input.value) {
          // Remove 'input_' prefix and trailing '_#' if they exist
          const fieldName = input.id.replace('input_', '').replace(/_\d+$/, '');
          formData[fieldName] = input.value;
        }
      });

      // Add user to Firestore
      await db.collection('users').doc(currentUser.uid).set({
        ...formData,
        email: currentUser.email,
        profileCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }, { merge: true }); // merge: true ensures we don't overwrite existing data

      console.log('Profile data saved to Firestore');
      
      // Wait a brief moment to ensure Firestore write completes
      setTimeout(() => {
        navigate('/landing');
      }, 1000);

    } catch (error) {
      console.error('Error saving profile to Firestore:', error);
      // Optionally show error to user
      alert('There was an error saving your profile. Please try again.');
    }
  };

  const renderProfileView = () => {
    if (!profileData) {
      return <ProfileForm />;
    }

    if (isEditing) {
      return <ProfileForm />;
    }

    return (
      <div className="profile-view">
        <h2>Your Profile Information</h2>
        {Object.entries(profileData).map(([key, value]) => {
          // Skip internal fields
          if (['createdAt', 'updatedAt', 'profileCompleted'].includes(key)) return null;
          return (
            <div key={key} className="profile-field">
              <strong>{key}: </strong>
              <span>{value.toString()}</span>
            </div>
          );
        })}
        <button
          className="edit-button"
          onClick={() => setIsEditing(true)}
        >
          Edit Profile
        </button>
      </div>
    );
  };

  return (
    <div className="profile-container">
      <h1>
        {!profileData ? 'Complete Your Profile' : 
         isEditing ? 'Edit Your Profile' : 'Your Profile'}
      </h1>
      <div className="profile-content">
        {renderProfileView()}
      </div>
      <button
        className="back-button"
        onClick={() => navigate('/landing')}
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default Profile;