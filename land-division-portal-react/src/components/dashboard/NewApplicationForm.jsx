import React, { useEffect, useState } from 'react';
import FormComponent from '../FormComponent';
import FormComponentBackup from '../FormComponentBackup';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/firebase';
import { Box, Button, Heading } from '@chakra-ui/react';
import { useTheme } from 'next-themes';

const NewApplicationForm = ({ onBack, additionalAutoFillData }) => {
  const { currentUser } = useAuth();
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

  const getMergedAutoFillData = () => {
    return {
      ...userProfile, // Base profile data
      ...(additionalAutoFillData || {}), // Additional data from parcel actions
    };
  };

  // Theme integration using next-themes to match our other components
  const { theme } = useTheme();
  const bgColor = theme === 'dark' ? 'gray.800' : 'gray.50';
  const textColor = theme === 'dark' ? 'whiteAlpha.900' : 'gray.800';

  return (
    <Box bg={bgColor} color={textColor} p={6} borderRadius="md">
      <Box mb={6}>
        <Button variant="ghost" onClick={onBack} mb={4}>
          ← Back to Applications
        </Button>
        <Heading as="h2" size="lg">
          New Land Division Application
        </Heading>
      </Box>
      <Box>
        {userProfile && (
          <FormComponent autoFillData={getMergedAutoFillData()} />
        )}
        {/* <FormComponentBackup /> */}
      </Box>
    </Box>
  );
};

export default NewApplicationForm;
