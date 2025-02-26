import React from "react";
import AuthUI from "./AuthUI";
import { Box, Container, Heading, Text } from "@chakra-ui/react";
import { useTheme } from "next-themes";

const SignIn = () => {
  const { theme } = useTheme();
  const headerBg = theme === "dark" ? "gray.800" : "gray.100";
  const footerBg = theme === "dark" ? "gray.700" : "gray.200";
  const mainBg = theme === "dark" ? "gray.900" : "white";
  const textColor = theme === 'dark' ? 'white' : 'black';

  return (
    <Box minH="100vh" display="flex" flexDirection="column" bg={mainBg}>
      <Box as="header" bg={headerBg} py={8} textAlign="center">
        <Heading as="h1" size="2xl" mb={4} color={textColor}>
          Van Buren County Land Division Portal
        </Heading>
        <Text fontSize="lg" color={textColor}>
          Welcome to the Van Buren County Land Division Portal! Please sign in to continue.
        </Text>
      </Box>
      <Container flex="1" py={8}>
        <AuthUI />
      </Container>
      <Box as="footer" bg={footerBg} py={4} textAlign="center">
        <Text color={textColor}>&copy; 2025 Your Company</Text>
      </Box>
    </Box>
  );
};

export default SignIn;
