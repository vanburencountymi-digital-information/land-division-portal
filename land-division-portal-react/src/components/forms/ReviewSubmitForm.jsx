import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  Alert,
  Heading,
  Input,
  Stack,
  Badge,
  Flex,
  Spinner
} from '@chakra-ui/react';
import { AccordionRoot, AccordionItemTrigger, AccordionItemContent, AccordionItem} from '../ui/accordion';
import { Checkbox } from '../ui/checkbox';
import { Field } from '../ui/field';
import { MdCheckCircle, MdInfo, MdWarning } from "react-icons/md";
import { useTheme } from 'next-themes';
import { db } from '../../firebase/firebase';

const ReviewSubmitForm = ({ 
  applicationId,
  onSubmit,
  isCompleted = false,
  actionType
}) => {
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? 'whiteAlpha.900' : 'gray.800';
  const borderColor = theme === 'dark' ? 'gray.600' : 'gray.200';
  const cardBg = theme === 'dark' ? 'gray.700' : 'white';
  const accentBg = theme === 'dark' ? 'blue.700' : 'blue.50';
  const inputBg = theme === 'dark' ? 'gray.700' : 'white';
  
  const [loading, setLoading] = useState(true);
  const [applicationData, setApplicationData] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [expandedSections, setExpandedSections] = useState(['applicant', 'parcels', 'documents']);

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        setLoading(true);
        const appDoc = await db.collection('applications').doc(applicationId).get();
        
        if (appDoc.exists) {
          setApplicationData(appDoc.data());
          
          // Pre-fill name if applicant info exists
          if (appDoc.data().applicantInfo) {
            setFirstName(appDoc.data().applicantInfo.firstName || '');
            setLastName(appDoc.data().applicantInfo.lastName || '');
          }
        } else {
          console.error('Application not found');
        }
      } catch (error) {
        console.error('Error fetching application data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (applicationId) {
      fetchApplicationData();
    }
  }, [applicationId]);

  const validateForm = () => {
    const errors = {};
    
    if (!firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!agreed) {
      errors.agreed = 'You must agree to the affidavit';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      // Update application status to submitted
      await db.collection('applications').doc(applicationId).update({
        status: 'submitted',
        submittedAt: new Date(),
        'stepStatuses.review': 'completed',
        affidavit: {
          agreed: true,
          firstName,
          lastName,
          timestamp: new Date()
        },
        updatedAt: new Date()
      });
      
      // Call the onSubmit callback
      onSubmit(applicationId);
    } catch (error) {
      console.error('Error submitting application:', error);
      setFormErrors({ submit: error.message });
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
            <Alert.Title>Application Submitted</Alert.Title>
            <Alert.Description>
              Your application has been successfully submitted for review.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      </VStack>
    );
  }

  if (loading) {
    return (
      <VStack spacing={6} align="stretch" alignItems="center" justifyContent="center" minH="200px">
        <Spinner size="xl" />
        <Text>Loading application data...</Text>
      </VStack>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="md">Review Your Application</Heading>
      
      <Text>
        Please review all information carefully before submitting your {actionType} application.
        Once submitted, you will not be able to make changes without contacting the township office.
      </Text>

      {/* Application Summary */}
      <Box>
        <Heading size="sm" mb={4}>Application Summary</Heading>
        <AccordionRoot 
          value={expandedSections} 
          onValueChange={(e) => setExpandedSections(e.value)}
          multiple
        >
          <Stack spacing={3}>
            <AccordionItem 
              value="applicant"
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
                  <Text fontWeight="bold">Applicant Information</Text>
                  <Badge colorScheme="green">Completed</Badge>
                </Flex>
              </AccordionItemTrigger>
              <AccordionItemContent px={4} py={3}>
                {applicationData?.applicantInfo && (
                  <Stack spacing={3}>
                    <Flex justify="space-between">
                      <Text fontWeight="bold">Name:</Text>
                      <Text>{applicationData.applicantInfo.firstName} {applicationData.applicantInfo.lastName}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text fontWeight="bold">Email:</Text>
                      <Text>{applicationData.applicantInfo.email}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text fontWeight="bold">Phone:</Text>
                      <Text>{applicationData.applicantInfo.phone}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text fontWeight="bold">Address:</Text>
                      <Text>{applicationData.applicantInfo.address}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text fontWeight="bold">City, State, ZIP:</Text>
                      <Text>
                        {applicationData.applicantInfo.city}, {applicationData.applicantInfo.state} {applicationData.applicantInfo.zip}
                      </Text>
                    </Flex>
                  </Stack>
                )}
              </AccordionItemContent>
            </AccordionItem>

            <AccordionItem 
              value="parcels"
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
                  <Text fontWeight="bold">Parcel Details</Text>
                  <Badge colorScheme="green">Completed</Badge>
                </Flex>
              </AccordionItemTrigger>
              <AccordionItemContent px={4} py={3}>
                {applicationData?.parcelInfo && (
                  <Stack spacing={4}>
                    <Text fontWeight="bold">Selected Parcels ({applicationData.parcelInfo.length}):</Text>
                    {applicationData.parcelInfo.map((parcel, index) => (
                      <Box 
                        key={index} 
                        p={3} 
                        borderWidth="1px" 
                        borderRadius="md" 
                        borderColor={borderColor}
                      >
                        <Stack spacing={2}>
                          <Flex justify="space-between">
                            <Text fontWeight="bold">Parcel Number:</Text>
                            <Text>{parcel.pnum}</Text>
                          </Flex>
                          <Flex justify="space-between">
                            <Text fontWeight="bold">Address:</Text>
                            <Text>{parcel.propstreetcombined}</Text>
                          </Flex>
                          <Flex justify="space-between">
                            <Text fontWeight="bold">Owner:</Text>
                            <Text>{parcel.ownername1}</Text>
                          </Flex>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                )}
              </AccordionItemContent>
            </AccordionItem>

            <AccordionItem 
              value="documents"
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
                  <Text fontWeight="bold">Documents</Text>
                  <Badge colorScheme="green">Completed</Badge>
                </Flex>
              </AccordionItemTrigger>
              <AccordionItemContent px={4} py={3}>
                {applicationData?.documents && (
                  <Stack spacing={3}>
                    <Text fontWeight="bold">Uploaded Documents:</Text>
                    {Object.entries(applicationData.documents).map(([key, doc]) => (
                      <Flex key={key} justify="space-between" align="center">
                        <Text>{doc.name || key}</Text>
                        <Badge colorScheme="green">Uploaded</Badge>
                      </Flex>
                    ))}
                  </Stack>
                )}
              </AccordionItemContent>
            </AccordionItem>
          </Stack>
        </AccordionRoot>
      </Box>

      {/* Affidavit */}
      <Box borderWidth="1px" borderRadius="md" p={4} bg={accentBg}>
        <Heading size="sm" mb={4}>Affidavit</Heading>
        <Text fontSize="sm" fontWeight="medium" mb={4}>
          I AGREE THE STATEMENTS MADE ABOVE ARE TRUE, AND IF FOUND NOT TO BE TRUE THIS APPLICATION AND ANY APPROVAL WILL BE VOID. 
          FURTHER I AGREE TO COMPLY WITH THE CONDITIONS AND REGULATIONS PROVIDED WITH THIS PARENT PARCEL DIVISION. 
          FURTHER I AGREE TO GIVE PERMISSION FOR OFFICIALS OF THE MUNICIPALITY, COUNTY AND THE STATE OF MICHIGAN TO ENTER THE PROPERTY 
          WHERE THIS PARCEL ADJUSTMENT IS REQUESTED FOR PURPOSES OF INSPECTION TO VERIFY THAT THE INFORMATION ON THE APPLICATION IS 
          CORRECT AT A TIME MUTUALLY AGREED WITH THE APPLICANT. I UNDERSTAND THIS IS ONLY A PARCEL ADJUSTMENT WHICH CONVEYS ONLY 
          CERTAIN RIGHTS UNDER THE APPLICABLE LOCAL LAND DIVISION ORDINANCE, THE LOCAL ZONING ORDINANCE, AND THE STATE LAND DIVISION 
          ACT AND DOES NOT INCLUDE ANY REPRESENTATION OR CONVEYANCE OF RIGHTS IN ANY OTHER STATUTE, BUILDING CODE, ZONING ORDINANCE, 
          DEED RESTRICTION OR OTHER PROPERTY RIGHTS. TOWNSHIP BOUNDARY ADJUSTMENT APPROVAL IN NO WAY GUARANTEES THE ISSUANCE OF A 
          BUILDING PERMIT.
        </Text>
        
        {/* <Divider my={4} /> */}
        
        <Field 
          label="First Name"
          required
          errorText={formErrors.firstName}
        >
          <Input
            id="firstName"
            name="firstName"
            placeholder="Enter your first name"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              if (formErrors.firstName) {
                setFormErrors(prev => ({ ...prev, firstName: undefined }));
              }
            }}
            required
            bg={inputBg}
          />
        </Field>
        
        <Field 
          label="Last Name"
          required
          errorText={formErrors.lastName}
          mt={3}
        >
          <Input
            id="lastName"
            name="lastName"
            placeholder="Enter your last name"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              if (formErrors.lastName) {
                setFormErrors(prev => ({ ...prev, lastName: undefined }));
              }
            }}
            required
            bg={inputBg}
          />
        </Field>
        
        <Box mt={4}>
          <Checkbox 
            isChecked={agreed}
            onChange={(e) => {
              setAgreed(e.target.checked);
              if (formErrors.agreed) {
                setFormErrors(prev => ({ ...prev, agreed: undefined }));
              }
            }}
            colorScheme="blue"
          >
            I have read and agree to the terms of the affidavit
          </Checkbox>
          {formErrors.agreed && (
            <Text color="red.500" fontSize="sm" mt={1}>{formErrors.agreed}</Text>
          )}
        </Box>
      </Box>

      {formErrors.submit && (
        <Alert.Root status="error" mb={4}>
          <Alert.Indicator>
            <MdWarning />
          </Alert.Indicator>
          <Alert.Content>
            <Alert.Title>Error</Alert.Title>
            <Alert.Description>{formErrors.submit}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      <Alert.Root status="info" mb={4}>
        <Alert.Indicator>
          <MdInfo />
        </Alert.Indicator>
        <Alert.Content>
          <Alert.Title>Important</Alert.Title>
          <Alert.Description>
            By submitting this application, you are certifying that all information provided is accurate and complete.
            Your application will be reviewed by township officials, and you may be contacted for additional information.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>

      <Button 
        colorScheme="blue" 
        size="lg" 
        onClick={handleSubmit}
        isDisabled={!applicationData}
        mt={4}
      >
        Submit Application
      </Button>
    </VStack>
  );
};

export default ReviewSubmitForm;