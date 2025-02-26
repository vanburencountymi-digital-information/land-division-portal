import React from 'react';
import Header from '../Header';
import { useAuth } from '../../contexts/AuthContext';
import { Box } from '@chakra-ui/react';

const DefaultLayout = ({ children }) => {
    const { currentUser } = useAuth();

    return (
        <Box minHeight="100vh" display="flex" flexDirection="column">
            {currentUser && <Header />}
            <Box flex="1" as="main" padding="4">
                {children}
            </Box>
            {/* You could add a footer here later if needed */}
        </Box>
    );
};

export default DefaultLayout;