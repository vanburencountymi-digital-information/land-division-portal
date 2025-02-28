import React from 'react';
import Header from '../Header';
import { useAuth } from '../../contexts/AuthContext';
import { Box } from '@chakra-ui/react';
import { useTheme } from 'next-themes';

const DefaultLayout = ({ children }) => {
    const { currentUser } = useAuth();
    const { theme } = useTheme();
    const bgColor = theme === 'dark' ? 'gray.800' : 'gray.50';

    return (
        <Box 
            minHeight="100vh" 
            display="flex" 
            flexDirection="column"
            bg={bgColor}
        >
            {currentUser && <Header />}
            <Box 
                flex="1" 
                as="main" 
                padding="4"
                bg={bgColor}
            >
                {children}
            </Box>
            {/* You could add a footer here later if needed */}
        </Box>
    );
};

export default DefaultLayout;