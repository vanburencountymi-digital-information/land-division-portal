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

const SignInCustom = () => {
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
    <Box maxW="md" mx="auto" p={6} boxShadow="lg" borderRadius="md" bg="white" divideY="1px" divideColor="gray.200">
      <VStack as="form" spacing={4} onSubmit={handleEmailSignIn}>
        <Field.Root isRequired>
          <Field.Label>Email address</Field.Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </Field.Root>
        <Field.Root isRequired>
          <Field.Label>Password</Field.Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
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
        <Button type="submit" colorPalette="teal" isLoading={loading} width="full">
          Sign In with Email
        </Button>
      </VStack>
      <Text mt={4} textAlign="center">
        OR
      </Text>
      <Button mt={4} colorPalette="red" onClick={handleGoogleSignIn} isLoading={loading} width="full">
        Sign In with Google
      </Button>
      <Text mt={4} textAlign="center">
        Don't have an account? <ChakraLink as={RouterLink} to="/signup">Sign up</ChakraLink>
      </Text>
    </Box>
  );
};

export default SignInCustom;
