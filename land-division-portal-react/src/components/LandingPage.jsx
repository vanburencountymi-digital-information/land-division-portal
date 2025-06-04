import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/firebase';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Button,
  Spinner,
} from '@chakra-ui/react';
import { useTheme } from 'next-themes';

const LandingPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme(); // Get the current theme ('light' or 'dark')
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
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  // Use theme-dependent colors, either by referencing tokens from your theme or by setting them conditionally.
  const bg = theme === 'dark' ? 'gray.800' : 'white';
  const textColor = theme === 'dark' ? 'white' : 'black';

  return (
    <VStack
      spacing={6}
      p={8}
      minH="100vh"
      justifyContent="center"
      bg={bg}
      color={textColor}
    >
      {userName && <Heading size="lg">Hi, {userName}!</Heading>}
      <Heading size="xl">
        {profileCompleted ? 'Welcome back to' : 'Welcome to'} the Land Management Portal
      </Heading>
      <HStack spacing={4}>
        <Button colorPalette="teal" onClick={() => navigate('/profile')}>
          Profile
        </Button>
        <Button
          colorPalette="purple"
          onClick={() => navigate('/dashboard')}
          disabled={!profileCompleted}
        >
          Dashboard
        </Button>
        <Button
          colorPalette="purple"
          onClick={() => navigate('/workflow-designer')}
          disabled={!profileCompleted}
        >
          Workflow Designer
        </Button>
      </HStack>
    </VStack>
  );
};

export default LandingPage;
