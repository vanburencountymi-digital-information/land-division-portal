import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react';
import { MdOutlineErrorOutline } from "react-icons/md";

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <Box 
            minHeight="100vh" 
            display="flex" 
            alignItems="center" 
            justifyContent="center"
            bg="gray.50"
        >
            <VStack spacing={6} p={8} bg="white" borderRadius="lg" boxShadow="lg">
                <MdOutlineErrorOutline w={12} h={12} color="red" />
                <Heading size="lg" textAlign="center">Access Denied</Heading>
                <Text textAlign="center" color="gray.600">
                    You don't have permission to access this page. 
                    Please contact your administrator if you believe this is a mistake.
                </Text>
                <Button 
                    colorScheme="blue" 
                    onClick={() => navigate('/dashboard')}
                >
                    Return to Dashboard
                </Button>
            </VStack>
        </Box>
    );
};

export default Unauthorized;