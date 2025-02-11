import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/firebase';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const checkUserProfile = async () => {
      try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        const userData = userDoc.data();
        setProfileCompleted(userDoc.exists && userData?.profileCompleted);
        
        if (userDoc.exists && userData?.first) {
          setUserName(userData.first);
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserProfile();
  }, [currentUser]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="landing-container">
      {userName && <h1>Hi, {userName}!</h1>}
      <h1>{profileCompleted ? 'Welcome back to' : 'Welcome to'} the Land Division Portal</h1>
      <div className="button-grid">
        <button
          className="landing-button"
          onClick={() => navigate('/profile')}
        >
          Profile
        </button>
        <button
          className="landing-button"
          onClick={() => navigate('/parcels')}
          disabled={!profileCompleted}
        >
          My Parcels
        </button>
        <button
          className="landing-button"
          onClick={() => navigate('/dashboard')}
          disabled={!profileCompleted}
        >
          My Applications
        </button>
        <button
          className="landing-button"
          onClick={() => navigate('/new-application')}
          disabled={!profileCompleted}
        >
          Start a New Application
        </button>
      </div>
    </div>
  );
};

export default LandingPage;