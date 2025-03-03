import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/firebase';
import { useTheme } from 'next-themes';
import {
  Box,
  VStack,
  Heading,
  Button,
  Text,
  Flex,
  Spinner,
} from '@chakra-ui/react';
import ProfileForm from './forms/ProfileForm';
import '../styles/Profile.css';

const Profile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [profileData, setProfileData] = React.useState(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  // Define colors based on current theme
  const bgColor = theme === 'dark' ? 'gray.800' : 'gray.100';
  const textColor = theme === 'dark' ? 'whiteAlpha.900' : 'gray.800';
  const cardBg = theme === 'dark' ? 'gray.700' : 'white';

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
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [currentUser.uid]);

  const handleProfileSubmit = async (formData) => {
    try {
      await db.collection('users').doc(currentUser.uid).set({
        ...formData,
        email: currentUser.email,
        profileCompleted: true,
        updatedAt: new Date(),
        ...(profileData?.createdAt ? { createdAt: profileData.createdAt } : { createdAt: new Date() })
      }, { merge: true });

      // Update local state
      setProfileData({
        ...formData,
        email: currentUser.email,
        profileCompleted: true,
        updatedAt: new Date(),
        ...(profileData?.createdAt ? { createdAt: profileData.createdAt } : { createdAt: new Date() })
      });
      
      // Exit edit mode if we were editing
      setIsEditing(false);

      // Navigate to landing page after successful submission
      navigate('/landing');

    } catch (error) {
      console.error('Error saving profile to Firestore:', error);
      throw error;
    }
  };

  const renderProfileView = () => {
    if (loading) {
      return (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="lg" />
          <Text ml={2}>Loading profile...</Text>
        </Flex>
      );
    }

    if (!profileData || isEditing) {
      return <ProfileForm 
        initialData={profileData} 
        onSubmit={handleProfileSubmit}
      />;
    }

    return (
      <Box bg={cardBg} p={6} borderRadius="md" shadow="md">
        <VStack spacing={4} align="stretch">
          {Object.entries(profileData).map(([key, value]) => {
            if (['createdAt', 'updatedAt', 'profileCompleted'].includes(key)) return null;
            return (
              <Flex key={key} justify="space-between">
                <Text fontWeight="bold" textTransform="capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </Text>
                <Text>{value.toString()}</Text>
              </Flex>
            );
          })}
          <Button
            colorScheme="blue"
            onClick={() => setIsEditing(true)}
            mt={4}
          >
            Edit Profile
          </Button>
        </VStack>
      </Box>
    );
  };

  return (
    <Box
      w="100%"
      maxW="800px"
      mx="auto"
      p={6}
      bg={bgColor}
      color={textColor}
      minH="100vh"
    >
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          {!profileData ? 'Complete Your Profile' : 
           isEditing ? 'Edit Your Profile' : 'Your Profile'}
        </Heading>
        
        {renderProfileView()}
        
        <Button
          variant="outline"
          onClick={() => navigate('/landing')}
          alignSelf="center"
        >
          Back to Dashboard
        </Button>
      </VStack>
    </Box>
  );
};

export default Profile;