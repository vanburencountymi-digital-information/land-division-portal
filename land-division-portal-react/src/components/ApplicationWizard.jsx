import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { toaster } from './ui/toaster';
import {
  Box,
  Button,
  Stack,
  Group,
  Heading,
  Text,
  List,
  Steps,
} from '@chakra-ui/react';
import {
  StepsRoot,
  StepsList,
  StepsItem,
  StepsContent,
  StepsCompletedContent,
  StepsPrevTrigger,
  StepsNextTrigger,
} from './ui/steps';

import { useTheme } from 'next-themes';

const ApplicationWizard = ({ selectedParcels, actionType, onCancel, onSelectSubStep }) => {
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? 'whiteAlpha.900' : 'gray.800';
  const borderColor = theme === 'dark' ? 'gray.600' : 'gray.200';
  const bgColor = theme === 'dark' ? 'gray.800' : 'white';

  const [applicationData, setApplicationData] = useState({
    applicantInfo: {},
    parcelInfo: selectedParcels,
    documents: {},
    status: 'draft'
  });

  const [currentMainStep, setCurrentMainStep] = useState(0);
  const [selectedSubStep, setSelectedSubStep] = useState(null);

  useEffect(() => {
    setSelectedSubStep(null);
  }, [currentMainStep]);

  const handleMainStepChange = (details) => {
    console.log('Main step changed to:', details.step);
    setCurrentMainStep(details.step);
  };

  const handleSubmit = async () => {
    try {
      const newApplication = {
        ...applicationData,
        type: actionType,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.collection('applications').add(newApplication);
      
      toaster.success({
        title: "Application Submitted",
        description: "Your application has been successfully submitted."
      });
      
      onCancel(); // Return to previous view
    } catch (error) {
      console.error("Error submitting application:", error);
      toaster.error({
        title: "Error Submitting Application",
        description: error.message
      });
    }
  };

  const workflowSteps = [
    {
      title: 'Submit Application',
      status: 'in-progress',
      subSteps: [
        { 
          id: 'applicant-info',
          title: 'Confirm Applicant Information',
          status: 'pending',
          isClickable: true
        },
        { 
          id: 'parcel-details',
          title: 'Confirm Parcel Details',
          status: 'pending',
          isClickable: true
        },
        { 
          id: 'documents',
          title: 'Upload Required Documents',
          status: 'pending',
          isClickable: true
        },
        { 
          id: 'review',
          title: 'Review & Submit',
          status: 'pending',
          isClickable: true
        },
      ],
    },
    {
      title: 'Township Review',
      status: 'locked',
      subSteps: [
        { 
          id: 'assessor-review',
          title: 'Application Review by Assessor',
          status: 'locked',
          isClickable: false
        },
        { 
          id: 'zoning-review',
          title: 'Application Review by Zoning Officer',
          status: 'locked',
          isClickable: false
        },
      ],
    },
    {
      title: 'Final Review',
      subSteps: [
        { title: 'Application Review by County Address Administrator', content: 'Application Review' },
        { title: 'New Parcels Created', content: 'New Parcels' },
      ],
    },
  ];

  const handleSubStepClick = (mainStepIndex, subStep) => {
    if (!subStep.isClickable) return;
    
    setSelectedSubStep(subStep.id);
    onSelectSubStep(subStep.id); // This would be passed up to parent to show appropriate form
  };

  const renderSubStepContent = () => {
    if (!selectedSubStep) return null;

    return (
      <Box
        mt={6}
        p={4}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="md"
        bg={bgColor}
      >
        {/* This will be replaced with the actual form components */}
        <Text>Form content for: {selectedSubStep}</Text>
      </Box>
    );
  };

  return (
    <Box p={4} color={textColor} minH="90vh">
      <Heading size="lg" mb={6} color={textColor}>{actionType} Application Progress</Heading>
      
      <Stack spacing={8}>
        <Box outline={borderColor} borderRadius="md" borderWidth="1px" padding={4}>
          <StepsRoot 
            orientation="horizontal" 
            step={currentMainStep}
            onStepChange={handleMainStepChange}
            count={workflowSteps.length}
            linear={false}
          >
            <StepsList>
              {workflowSteps.map((step, index) => (
                <StepsItem
                  key={index}
                  index={index}
                  title={step.title}
                  disabled={step.status === 'locked'}
                />
              ))}
            </StepsList>
          </StepsRoot>
        </Box>

        {/* Sub-steps for current main step */}
        {workflowSteps[currentMainStep] && (
          <Box>
            <Heading size="md" mb={4}>
              {workflowSteps[currentMainStep].title} Details
            </Heading>
            <List.Root spacing={2}>
              {workflowSteps[currentMainStep].subSteps.map((subStep, index) => (
                <List.Item
                  key={index}
                  p={3}
                  cursor={subStep.isClickable ? 'pointer' : 'default'}
                  bg={selectedSubStep === subStep.id ? `${bgColor}` : 'transparent'}
                  _hover={subStep.isClickable ? { bg: `${bgColor}` } : {}}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor={borderColor}
                  onClick={() => handleSubStepClick(currentMainStep, subStep)}
                >
                  <Stack direction="row" align="center" justify="space-between">
                    <Text>{subStep.title}</Text>
                    {subStep.status && (
                      <Text
                        fontSize="sm"
                        color={subStep.status === 'locked' ? 'gray.500' : 'blue.500'}
                      >
                        {subStep.status}
                      </Text>
                    )}
                  </Stack>
                </List.Item>
              ))}
            </List.Root>
          </Box>
        )}

        {/* Render selected sub-step content */}
        {renderSubStepContent()}
      </Stack>
    </Box>
  );
};

export default ApplicationWizard;