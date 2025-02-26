import React, { useState } from 'react';
import { db } from '../firebase/firebase';
import { toaster } from './ui/toaster';
import {
  Box,
  Button,
  Stack,
  Group,
  Heading,
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

const ApplicationWizard = ({ selectedParcels, actionType, onCancel }) => {
  const [applicationData, setApplicationData] = useState({
    applicantInfo: {},
    parcelInfo: selectedParcels,
    documents: {},
    status: 'draft'
  });

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

  return (
    <Box p={4}>
      <Heading size="lg" mb={6}>{actionType} Application</Heading>
      
      <StepsRoot 
        orientation="vertical" 
        height="400px" 
        defaultValue={0} 
        count={4}
      >
        {({ value }) => (
          <>
            <StepsList>
              <StepsItem index={0} title="Verify Applicant Information" />
              <StepsItem index={1} title="Confirm Parcel Details" />
              <StepsItem index={2} title="Upload Required Documents" />
              <StepsItem index={3} title="Review & Submit" />
            </StepsList>

            <Stack>
              <StepsContent index={0}>
                {/* Applicant Info Component */}
                Verify your information
              </StepsContent>
              
              <StepsContent index={1}>
                {/* Parcel Details Component */}
                Review selected parcels
              </StepsContent>
              
              <StepsContent index={2}>
                {/* Document Upload Component */}
                Upload required documents
              </StepsContent>
              
              <StepsContent index={3}>
                {/* Review Component */}
                Review your application
              </StepsContent>

              <StepsCompletedContent>
                Ready to submit your application!
              </StepsCompletedContent>

              <Group>
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Box>
                  <StepsPrevTrigger asChild>
                    <Button variant="outline" mr={2}>
                      Previous
                    </Button>
                  </StepsPrevTrigger>
                  <StepsNextTrigger asChild>
                    <Button 
                      colorScheme="blue"
                      onClick={value === 3 ? handleSubmit : undefined}
                    >
                      {value === 3 ? 'Submit' : 'Next'}
                    </Button>
                  </StepsNextTrigger>
                </Box>
              </Group>
            </Stack>
          </>
        )}
      </StepsRoot>
    </Box>
  );
};

export default ApplicationWizard;