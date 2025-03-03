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
import { auth, db } from '../firebase/firebase';
import { ROLES } from '../utils/roles';
import { useTheme } from 'next-themes';

const SignUp = () => {
    const { theme } = useTheme();
    const bgColor = theme === 'dark' ? 'gray.700' : 'white';
    const textColor = theme === 'dark' ? 'white' : 'black';
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        try {
            setError('');
            setLoading(true);
            
            // Create the user in Firebase Auth
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            
            // Create a user document in Firestore
            await db.collection('users').doc(userCredential.user.uid).set({
                email: email,
                role: ROLES.USER, // Default role for new users
                createdAt: new Date().toISOString()
            });

            // Navigate to dashboard after successful signup
            navigate('/dashboard');
        } catch (error) {
            setError(error.message);
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
            <Text fontSize="2xl" fontWeight="bold" mb={6} textAlign="center">
                Create an Account
            </Text>
            
            {error && (
                <Alert.Root status="error" mb={4}>
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>Error</Alert.Title>
                        <Alert.Description>{error}</Alert.Description>
                    </Alert.Content>
                </Alert.Root>
            )}

            <VStack as="form" spacing={4} onSubmit={handleSubmit}>
                <Field.Root isRequired>
                    <Field.Label color={textColor}>Email</Field.Label>
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

                <Field.Root isRequired>
                    <Field.Label color={textColor}>Confirm Password</Field.Label>
                    <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        bg={theme === 'dark' ? 'gray.600' : 'white'}
                        color={textColor}
                        borderColor={theme === 'dark' ? 'gray.500' : 'gray.200'}
                    />
                </Field.Root>

                <Button
                    type="submit"
                    colorPalette="teal"
                    isLoading={loading}
                    width="full"
                    mt={2}
                >
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </Button>
            </VStack>

            <Text mt={4} textAlign="center" color={textColor}>
                Already have an account?{' '}
                <ChakraLink 
                    as={RouterLink} 
                    to="/" 
                    color={theme === 'dark' ? 'teal.300' : 'teal.500'}
                >
                    Sign In
                </ChakraLink>
            </Text>
        </Box>
    );
};

export default SignUp;