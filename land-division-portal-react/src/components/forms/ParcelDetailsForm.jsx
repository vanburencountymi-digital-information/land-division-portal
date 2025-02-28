import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  Alert,
  Flex,
  Heading,
  Badge,
  Stack,
} from '@chakra-ui/react';
import { AccordionRoot,AccordionItem, AccordionItemTrigger, AccordionItemContent } from '../ui/accordion';
import { MdCheckCircle, MdInfo } from "react-icons/md";
import { useTheme } from 'next-themes';

const ParcelDetailsForm = ({ 
  parcels, 
  onConfirm, 
  onNext,
  applicationId,
  isCompleted = false,
  actionType
}) => {
  const [expandedParcels, setExpandedParcels] = useState([]);
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? 'whiteAlpha.900' : 'gray.800';
  const borderColor = theme === 'dark' ? 'gray.600' : 'gray.200';
  const cardBg = theme === 'dark' ? 'gray.700' : 'white';
  const accentBg = theme === 'dark' ? 'blue.700' : 'blue.50';

  const handleSubmit = async () => {
    try {
      // Create parcel details object with confirmation timestamp
      const parcelDetails = {
        parcels,
        confirmedAt: new Date()
      };
      
      await onConfirm(applicationId, parcelDetails);
      onNext(); // Move to next step in wizard
    } catch (error) {
      console.error('Error confirming parcel details:', error);
      throw error;
    }
  };

  const toggleParcelExpansion = (parcelId) => {
    setExpandedParcels(prev => 
      prev.includes(parcelId)
        ? prev.filter(id => id !== parcelId)
        : [...prev, parcelId]
    );
  };

  // Helper function to get action-specific instructions
  const getActionInstructions = () => {
    switch(actionType) {
      case 'Split':
        return "You are splitting this parcel into multiple new parcels. Please confirm the details of the parcel to be split.";
      case 'Combination':
        return "You are combining these parcels into a single new parcel. Please confirm the details of all parcels to be combined.";
      case 'Boundary Line Adjustment':
        return "You are adjusting the boundary between these parcels. Please confirm the details of both parcels involved.";
      default:
        return "Please review and confirm the details of the selected parcels for your application.";
    }
  };

  // Check if all parcels have the same owner
  const checkOwnership = () => {
    if (!parcels || parcels.length <= 1) return { sameOwner: true, ownerName: parcels[0]?.ownername1 };
    
    const firstOwner = parcels[0]?.ownername1;
    const allSameOwner = parcels.every(parcel => 
      parcel.ownername1 && parcel.ownername1.toLowerCase() === firstOwner.toLowerCase()
    );
    
    return { sameOwner: allSameOwner, ownerName: firstOwner };
  };

  const { sameOwner, ownerName } = checkOwnership();

  // Get ownership warning message based on action type
  const getOwnershipWarning = () => {
    if (sameOwner) return null;
    
    switch(actionType) {
      case 'Property Combination':
        return (
          <Alert.Root status="warning" mb={4}>
            <Alert.Indicator>
              <MdInfo />
            </Alert.Indicator>
            <Alert.Content>
              <Alert.Title>Different Owners Detected</Alert.Title>
              <Alert.Description>
                The parcels you are trying to combine appear to have different owners. The Equalization Department 
                will need to verify that you have legal ownership of all parcels before the combination can be processed. 
                This may require additional documentation and could extend the processing time.
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
        );
      case 'Boundary Line Adjustment':
        return (
          <Alert.Root status="info" mb={4}>
            <Alert.Indicator>
              <MdInfo />
            </Alert.Indicator>
            <Alert.Content>
              <Alert.Title>Different Owners Noted</Alert.Title>
              <Alert.Description>
                The parcels involved in this boundary line adjustment have different owners, which is common for this type of action.
                You will need to provide a deed that transfers the adjusted portion of land between the property owners.
                The Equalization Department will verify this deed as part of the application process.
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
        );
      default:
        return null;
    }
  };

  if (isCompleted) {
    return (
      <VStack spacing={6} align="stretch">
        <Alert.Root status="success">
          <Alert.Indicator>
            <MdCheckCircle />
          </Alert.Indicator>
          <Alert.Content>
            Parcel details have been confirmed.
          </Alert.Content>
        </Alert.Root>
        <Box>
          <Heading size="sm" mb={4}>Selected Parcels ({parcels.length})</Heading>
          {parcels.map(parcel => (
            <Box 
              key={parcel.id || `parcel-${parcel.pnum}`}
              p={3}
              mb={2}
              borderWidth="1px"
              borderRadius="md"
              bg={cardBg}
            >
              <Flex justify="space-between" align="center">
                <Text fontWeight="bold">{parcel.pnum}</Text>
                <Badge colorScheme="green">Confirmed</Badge>
              </Flex>
              <Text>{parcel.ownername1}</Text>
              <Text fontSize="sm">{parcel.propstreetcombined}, {parcel.propcity}</Text>
            </Box>
          ))}
        </Box>
      </VStack>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <Text>
        {getActionInstructions()}
      </Text>

      <Alert.Root status="info" mb={4}>
        <Alert.Indicator>
          <MdInfo />
        </Alert.Indicator>
        <Alert.Content>
          Click on a parcel to view more details. You must confirm these details before proceeding.
        </Alert.Content>
      </Alert.Root>

      {/* Display ownership warning if applicable */}
      {getOwnershipWarning()}

      <Box>
        <Heading size="sm" mb={4}>Selected Parcels ({parcels.length})</Heading>
        <AccordionRoot 
          value={expandedParcels} 
          onValueChange={(e) => setExpandedParcels(e.value)}
          multiple
        >
          <Stack spacing={3}>
            {parcels.map(parcel => (
              <AccordionItem 
                key={parcel.id || `parcel-${parcel.pnum}`}
                value={parcel.pnum}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="md"
                overflow="hidden"
              >
                <AccordionItemTrigger 
                  py={3}
                  px={4}
                  _expanded={{ bg: accentBg }}
                >
                  <Flex justify="space-between" align="center" width="100%">
                    <Text fontWeight="bold">{parcel.pnum}</Text>
                    <Text fontSize="sm">{parcel.propstreetcombined}</Text>
                  </Flex>
                </AccordionItemTrigger>
                <AccordionItemContent px={4} py={3}>
                  <VStack align="stretch" spacing={3} divideY="2px" divideColor={borderColor}>
                    {/* Property Information */}
                    <Box>
                      <Heading size="xs" mb={2}>Property Information</Heading>
                      <Flex wrap="wrap" gridGap={4}>
                        <Box flex="1" minW="200px">
                          <Text fontWeight="bold">Property Address:</Text>
                          <Text>{parcel.propstreetcombined}</Text>
                        </Box>
                        <Box flex="1" minW="200px">
                          <Text fontWeight="bold">Location:</Text>
                          <Text>{parcel.propcity}, {parcel.propstate} {parcel.propzip}</Text>
                        </Box>
                        <Box flex="1" minW="200px">
                          <Text fontWeight="bold">Homestead:</Text>
                          <Text>{parcel.homestead}%</Text>
                        </Box>
                        <Box flex="1" minW="200px">
                          <Text fontWeight="bold">School District:</Text>
                          <Text>{parcel.schooldist}</Text>
                        </Box>
                        <Box flex="1" minW="200px">
                          <Text fontWeight="bold">Property Class:</Text>
                          <Text>{parcel.propclass}</Text>
                        </Box>
                      </Flex>
                    </Box>
                    
                    {/* Owner Information */}
                    <Box pt={2}>
                      <Heading size="xs" mb={2}>Owner Information</Heading>
                      <Flex wrap="wrap" gridGap={4}>
                        <Box flex="1" minW="200px">
                          <Text fontWeight="bold">Owner Name:</Text>
                          <Text 
                            fontWeight={!sameOwner && parcel.ownername1 !== ownerName ? "bold" : "normal"}
                            color={!sameOwner && parcel.ownername1 !== ownerName ? "orange.500" : "inherit"}
                          >
                            {parcel.ownername1}
                          </Text>
                        </Box>
                        <Box flex="1" minW="200px">
                          <Text fontWeight="bold">Owner Address:</Text>
                          <Text>{parcel.ownerstreetaddr}</Text>
                        </Box>
                        <Box flex="1" minW="200px">
                          <Text fontWeight="bold">Owner Location:</Text>
                          <Text>{parcel.ownercity}, {parcel.ownerstate} {parcel.ownerzip}</Text>
                        </Box>
                      </Flex>
                    </Box>
                    
                    {/* Legal Description */}
                    <Box pt={2}>
                      <Heading size="xs" mb={2}>Legal Description</Heading>
                      <Text fontSize="sm">{parcel.legalDescription || "No legal description available"}</Text>
                    </Box>
                  </VStack>
                </AccordionItemContent>
              </AccordionItem>
            ))}
          </Stack>
        </AccordionRoot>
      </Box>

      <Button 
        colorScheme="blue" 
        size="lg" 
        onClick={handleSubmit}
        isDisabled={parcels.length === 0}
        mt={4}
      >
        Confirm Parcel Details
      </Button>
    </VStack>
  );
};

export default ParcelDetailsForm;