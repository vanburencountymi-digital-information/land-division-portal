import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/firebase';
import {
  Box,
  Flex,
  Heading,
  Button,
  Text,
  Spinner,
} from '@chakra-ui/react';
import { useTheme } from 'next-themes';

const ApplicationList = ({ onApplicationClick, onNewApplication }) => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define colors based on current theme
  const bgColor = theme === 'dark' ? 'gray.800' : 'gray.100';
  const textColor = theme === 'dark' ? 'whiteAlpha.900' : 'gray.800';
  const cardBg = theme === 'dark' ? 'gray.700' : 'white';
  const cardHoverBg = theme === 'dark' ? 'gray.600' : 'gray.50';

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const applicationsRef = db.collection('applications');
        const snapshot = await applicationsRef
          .where('userId', '==', currentUser.uid)
          .orderBy('createdAt', 'desc')
          .get();

        const applicationData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setApplications(applicationData);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [currentUser]);

  if (loading) {
    return (
      <Flex
        justify="center"
        align="center"
        height="100%"
        bg={bgColor}
        color={textColor}
        p={4}
      >
        <Spinner size="lg" />
        <Text ml={2}>Loading your applications...</Text>
      </Flex>
    );
  }

  return (
    <Box p={4} bg={bgColor} color={textColor} minHeight="10vh">
      <Flex justify="space-between" align="center" mb={4}>
        <Heading as="h2" size="lg">
          My Applications
        </Heading>
        <Button colorPalette="blue" onClick={onNewApplication}>
          Start a New Application
        </Button>
      </Flex>

      {applications.length === 0 ? (
        <Box textAlign="center">
          <Text>You haven't submitted any applications yet.</Text>
          <Text>Search for parcels, select the parcels and action to begin the application process.</Text>
        </Box>
      ) : (
        <Box>
          {applications.map(application => (
            <Flex
              key={application.id}
              p={4}
              bg={cardBg}
              borderWidth="1px"
              borderRadius="md"
              mb={2}
              align="center"
              justify="space-between"
              cursor="pointer"
              _hover={{ bg: cardHoverBg }}
              onClick={() => onApplicationClick(application.id)}
            >
              <Box>
                <Heading as="h3" size="md">
                  {application.type || 'Land Division Application'}
                </Heading>
                <Text>Status: {application.status || 'Pending'}</Text>
                <Text>
                  Submitted:{' '}
                  {application.createdAt?.toDate().toLocaleDateString()}
                </Text>
              </Box>
              <Box fontSize="2xl" ml={4}>
                →
              </Box>
            </Flex>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ApplicationList;
