import React from 'react';
import ProfileForm from '../ProfileForm';
import {
  Box,
  VStack,
  Text,
  Button,
  Alert,
} from '@chakra-ui/react';
import { MdCheckCircle } from "react-icons/md";

const ApplicantInfoForm = ({ 
  profileData, 
  onConfirm, 
  onNext,
  applicationId,
  isCompleted = false
}) => {
  const handleSubmit = async (formData) => {
    try {
      // Create or update application document with applicant information
      const applicantInfo = {
        ...formData,
        confirmedAt: new Date()
      };
      
      await onConfirm(applicationId, applicantInfo);
      onNext(); // Move to next step in wizard
    } catch (error) {
      console.error('Error saving applicant information:', error);
      throw error;
    }
  };

  if (isCompleted) {
    return (
      <VStack spacing={6} align="stretch">
        <Alert.Root status="success">
          <Alert.Indicator />
          <Alert.Content>
            Applicant information has been confirmed.
          </Alert.Content>
        </Alert.Root>
        <ProfileForm
          initialData={profileData}
          onSubmit={handleSubmit}
          submitButtonText="Update & Continue"
          showBackToDashboard={false}
          isReadOnly={true}
        />
      </VStack>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <Text>
        Please review your information below. You can make changes if needed.
        This information will be used in your application.
      </Text>

      <ProfileForm
        initialData={profileData}
        onSubmit={handleSubmit}
        submitButtonText="Confirm & Continue"
        showBackToDashboard={false}
      />
    </VStack>
  );
};

export default ApplicantInfoForm;