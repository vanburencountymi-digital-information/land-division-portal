// Header.js
import React from 'react';
import { useTheme } from 'next-themes';
import { Box, Flex, Heading, Button, HStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../utils/roles';

const Header = () => {
  const { theme, setTheme } = useTheme();
  const bgColor = theme === 'dark' ? 'blue.700' : 'blue.100';
  const textColor = theme === 'dark' ? 'white' : 'black';
  const navigate = useNavigate();
  const { logout, currentUser, userRole } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/'); // Navigate to sign in page
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  return (
    <Box bg={bgColor} px={4} py={2}>
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <HStack spacing={8} alignItems="center">
          <Heading as="h1" size="xl" color={textColor}>
            Land Division Portal
          </Heading>
          <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }}>
            <Button variant="ghost" color={textColor} onClick={() => navigate('/landing')}>
              Home
            </Button>
            <Button variant="ghost" color={textColor}>
              Applications
            </Button>
            {hasPermission(userRole, 'canManageUsers') && (
              <Button variant="ghost" color={textColor} onClick={() => navigate('/user-management')}>
                User Management
              </Button>
            )}
            {userRole === 'admin' && (
              <Button variant="ghost" color={textColor} onClick={() => navigate('/workflow-tester')}>
                Workflow Tester
              </Button>
            )}
          </HStack>
        </HStack>
        <Flex alignItems="center">
          <Button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            colorPalette="teal"
            variant="solid"
          >
            Toggle {theme === 'light' ? 'Dark' : 'Light'}
          </Button>
        </Flex>
        {currentUser && (
          <Flex alignItems="center">
            <span style={{ marginRight: '1rem' }}>{currentUser.email}</span>
            <Button
              onClick={handleSignOut}
              colorPalette="red"
              variant="solid"
            >
              Sign Out
            </Button>
          </Flex>
        )}
      </Flex>
    </Box>
  );
};

export default Header;
