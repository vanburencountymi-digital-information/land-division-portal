import React, { useState } from 'react';
import {
  Box,
  Input,
  Button,
  Text,
  VStack,
  Alert,
  Field,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { auth } from '../firebase/firebase';
import { useTheme } from 'next-themes';

const SignInCustom = () => {
  const { theme } = useTheme();
  const bgColor = theme === 'dark' ? 'gray.700' : 'white';
  const textColor = theme === 'dark' ? 'white' : 'black';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      console.log('Sign in successful, waiting for auth state...');
      
      // Wait briefly for auth state to update
      setTimeout(() => {
        console.log('Navigating to landing page...');
        navigate('/landing', { replace: true });
      }, 500);
      
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const userCredential = await auth.signInWithPopup(provider);
      console.log('Google sign in successful, waiting for auth state...');
      
      // Wait briefly for auth state to update
      setTimeout(() => {
        console.log('Navigating to landing page...');
        navigate('/landing', { replace: true });
      }, 500);
      
    } catch (err) {
      console.error('Google sign in error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      maxW="md" 
      mx="auto" 
      p={6} 
      boxShadow="lg" 
      borderRadius="md" 
      bg={bgColor} 
      color={textColor}
      divideY="1px" 
      divideColor={theme === 'dark' ? 'gray.600' : 'gray.200'}
    >
      <VStack as="form" spacing={4} onSubmit={handleEmailSignIn}>
        <Field.Root isRequired>
          <Field.Label color={textColor}>Email address</Field.Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            bg={theme === 'dark' ? 'gray.600' : 'white'}
            color={textColor}
            borderColor={theme === 'dark' ? 'gray.500' : 'gray.200'}
          />
        </Field.Root>
        <Field.Root isRequired>
          <Field.Label color={textColor}>Password</Field.Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            bg={theme === 'dark' ? 'gray.600' : 'white'}
            color={textColor}
            borderColor={theme === 'dark' ? 'gray.500' : 'gray.200'}
          />
        </Field.Root>
        {error && (
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Error</Alert.Title>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}
        <Button 
          type="submit" 
          colorPalette="teal" 
          isLoading={loading} 
          width="full"
        >
          Sign In with Email
        </Button>
      </VStack>
      <Text mt={4} textAlign="center" color={textColor}>
        OR
      </Text>
      <Button 
        mt={4} 
        colorPalette="red" 
        onClick={handleGoogleSignIn} 
        isLoading={loading} 
        width="full"
      >
        Sign In with Google
      </Button>
      <Text mt={4} textAlign="center" color={textColor}>
        Don't have an account?{' '}
        <ChakraLink 
          as={RouterLink} 
          to="/signup" 
          color={theme === 'dark' ? 'teal.300' : 'teal.500'}
        >
          Sign up
        </ChakraLink>
      </Text>
    </Box>
  );
};

export default SignInCustom;
