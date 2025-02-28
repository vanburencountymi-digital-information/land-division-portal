import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { toaster } from './ui/oldCustomToaster';
import {
  Box,
  Button,
  Stack,
  Group,
  Heading,
  Text,
  List,
  Steps,
  Spinner,
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
import { useAuth } from '../contexts/AuthContext';
import ApplicantInfoForm from './forms/ApplicantInfoForm';
import ParcelDetailsForm from './forms/ParcelDetailsForm';
import DocumentUploadForm from './forms/DocumentUploadForm';
import ReviewSubmitForm from './forms/ReviewSubmitForm';
import { MdCheckCircle, MdLock, MdHourglassEmpty, MdError } from "react-icons/md";

const ApplicationWizard = ({ 
  selectedParcels, 
  actionType, 
  onCancel, 
  onSelectSubStep, 
  existingApplicationId = null,
  isEditMode = false
}) => {
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
  const [selectedSubStep, setSelectedSubStep] = useState('applicant-info');
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = React.useState(null);
  const [applicationId, setApplicationId] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [stepStatuses, setStepStatuses] = React.useState({});
  const [selectedAction, setSelectedAction] = useState(actionType);
  const [workflowSteps, setWorkflowSteps] = useState([
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
          status: 'locked',
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
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile data
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        if (userDoc.exists) {
          setProfileData(userDoc.data());
        }

        // If we're loading an existing application
        if (existingApplicationId) {
          const appDoc = await db.collection('applications').doc(existingApplicationId).get();
          
          if (appDoc.exists) {
            const appData = appDoc.data();
            setApplicationId(existingApplicationId);
            setStepStatuses(appData.stepStatuses || {});
            setApplicationData({
              applicantInfo: appData.applicantInfo || {},
              parcelInfo: appData.parcelInfo || selectedParcels,
              documents: appData.documents || {},
              status: appData.status || 'draft'
            });
            console.log('Application data stepStatuses:', appData.stepStatuses);
            
            // If we have action type from the application, use it
            if (appData.type) {
              setSelectedAction(appData.type);
            }
            
            // Update workflow steps based on application data
            updateWorkflowStepsFromApplication(appData);
            
            // Determine the current substep based on application data
            const currentSubStep = determineCurrentSubStep(appData.stepStatuses || {});
            setSelectedSubStep(currentSubStep);
          } else {
            console.error('Application not found');
            // Create new draft application as fallback
            createNewDraftApplication();
          }
        } else {
          // Create new draft application with the selected action type
          createNewDraftApplication();
        }
      } catch (error) {
        console.error('Error initializing application:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser.uid, existingApplicationId, selectedParcels, actionType]);

  const createNewDraftApplication = async () => {
    try {
      const newAppRef = await db.collection('applications').add({
        userId: currentUser.uid,
        status: 'draft',
        type: actionType || 'unknown', // Make sure we save the action type
        parcelInfo: selectedParcels,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      setApplicationId(newAppRef.id);
    } catch (error) {
      console.error('Error creating new application:', error);
    }
  };

  // Add a function to update the action type
  const updateActionType = async (newActionType) => {
    try {
      if (applicationId) {
        await db.collection('applications').doc(applicationId).update({
          type: newActionType,
          updatedAt: new Date()
        });
        setSelectedAction(newActionType);
      }
    } catch (error) {
      console.error('Error updating action type:', error);
    }
  };

  const updateWorkflowStepsFromApplication = (appData) => {
    // Update workflow steps based on application status and step statuses
    const updatedWorkflowSteps = [...workflowSteps];
    
    // Example: Update substep statuses based on application data
    if (appData.stepStatuses) {
      updatedWorkflowSteps.forEach(step => {
        step.subSteps.forEach(subStep => {
          if (appData.stepStatuses[subStep.id]) {
            subStep.status = appData.stepStatuses[subStep.id];
          }
        });
      });
      
      // Update main step status based on substeps
      updatedWorkflowSteps.forEach(step => {
        const allSubStepsCompleted = step.subSteps.every(
          subStep => appData.stepStatuses[subStep.id] === 'completed'
        );
        
        const anySubStepStarted = step.subSteps.some(
          subStep => appData.stepStatuses[subStep.id] === 'completed' || 
                    appData.stepStatuses[subStep.id] === 'in-progress'
        );
        
        if (allSubStepsCompleted) {
          step.status = 'completed';
        } else if (anySubStepStarted) {
          step.status = 'in-progress';
        }
      });
      
      // Check if review step should be unlocked
      const updatedSteps = checkAndUpdateReviewStatus(updatedWorkflowSteps);
      setWorkflowSteps(updatedSteps);
    } else {
      setWorkflowSteps(updatedWorkflowSteps);
    }
  };

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

  const handleSubStepClick = (mainStepIndex, subStep) => {
    if (!subStep.isClickable) return;
    
    setSelectedSubStep(subStep.id);
    onSelectSubStep(subStep.id); // This would be passed up to parent to show appropriate form
  };

  const handleApplicantInfoConfirm = async (applicationId, applicantInfo) => {
    try {
      console.log('Starting handleApplicantInfoConfirm');
      console.log('Application ID:', applicationId);
      console.log('Applicant Info:', applicantInfo);
      
      // Update application with applicant info
      await db.collection('applications').doc(applicationId).update({
        applicantInfo,
        updatedAt: new Date(),
        'stepStatuses.applicant-info': 'completed'
      });

      console.log('Successfully updated Firestore');

      // Update local state
      setStepStatuses(prev => ({
        ...prev,
        confirmApplicantInfo: 'completed'
      }));
      
      // Update the workflow steps to mark the current substep as completed
      const updatedWorkflowSteps = [...workflowSteps];
      const currentStepIndex = updatedWorkflowSteps.findIndex(step => 
        step.subSteps.some(subStep => subStep.id === 'applicant-info')
      );
      
      if (currentStepIndex !== -1) {
        const subStepIndex = updatedWorkflowSteps[currentStepIndex].subSteps.findIndex(
          subStep => subStep.id === 'applicant-info'
        );
        
        if (subStepIndex !== -1) {
          updatedWorkflowSteps[currentStepIndex].subSteps[subStepIndex].status = 'completed';
          
          // If there's a next substep, set it as the selected one
          if (subStepIndex < updatedWorkflowSteps[currentStepIndex].subSteps.length - 1) {
            const nextSubStep = updatedWorkflowSteps[currentStepIndex].subSteps[subStepIndex + 1];
            setSelectedSubStep(nextSubStep.id);
          }
        }
      }
      
      setWorkflowSteps(updatedWorkflowSteps);
    } catch (error) {
      console.error('Error in handleApplicantInfoConfirm:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  };

  const handleParcelDetailsConfirm = async (applicationId, parcelDetails) => {
    try {
      console.log('Starting handleParcelDetailsConfirm');
      console.log('Application ID:', applicationId);
      
      // Update application with parcel details
      await db.collection('applications').doc(applicationId).update({
        parcelDetails,
        updatedAt: new Date(),
        'stepStatuses.parcel-details': 'completed'
      });

      console.log('Successfully updated Firestore with parcel details');

      // Update local state
      setStepStatuses(prev => ({
        ...prev,
        'parcel-details': 'completed'
      }));
      
      // Update the workflow steps to mark the current substep as completed
      const updatedWorkflowSteps = [...workflowSteps];
      const currentStepIndex = updatedWorkflowSteps.findIndex(step => 
        step.subSteps.some(subStep => subStep.id === 'parcel-details')
      );
      
      if (currentStepIndex !== -1) {
        const subStepIndex = updatedWorkflowSteps[currentStepIndex].subSteps.findIndex(
          subStep => subStep.id === 'parcel-details'
        );
        
        if (subStepIndex !== -1) {
          updatedWorkflowSteps[currentStepIndex].subSteps[subStepIndex].status = 'completed';
          
          // If there's a next substep, set it as the selected one
          if (subStepIndex < updatedWorkflowSteps[currentStepIndex].subSteps.length - 1) {
            const nextSubStep = updatedWorkflowSteps[currentStepIndex].subSteps[subStepIndex + 1];
            setSelectedSubStep(nextSubStep.id);
          }
        }
      }
      
      setWorkflowSteps(updatedWorkflowSteps);
    } catch (error) {
      console.error('Error in handleParcelDetailsConfirm:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  };

  const handleDocumentsConfirm = async (applicationId, documentData) => {
    try {
      console.log('Starting handleDocumentsConfirm');
      console.log('Application ID:', applicationId);
      
      // Update application with document data
      await db.collection('applications').doc(applicationId).update({
        documents: documentData.documents,
        updatedAt: new Date(),
        'stepStatuses.documents': 'completed'
      });

      console.log('Successfully updated Firestore with document data');

      // Update local state
      setStepStatuses(prev => ({
        ...prev,
        'documents': 'completed'
      }));
      
      // Update the workflow steps to mark the current substep as completed
      const updatedWorkflowSteps = [...workflowSteps];
      const currentStepIndex = updatedWorkflowSteps.findIndex(step => 
        step.subSteps.some(subStep => subStep.id === 'documents')
      );
      
      if (currentStepIndex !== -1) {
        const subStepIndex = updatedWorkflowSteps[currentStepIndex].subSteps.findIndex(
          subStep => subStep.id === 'documents'
        );
        
        if (subStepIndex !== -1) {
          updatedWorkflowSteps[currentStepIndex].subSteps[subStepIndex].status = 'completed';
          
          // Check if all three initial substeps are completed
          const firstThreeSubsteps = updatedWorkflowSteps[currentStepIndex].subSteps.slice(0, 3);
          const allFirstThreeCompleted = firstThreeSubsteps.every(
            subStep => subStep.status === 'completed'
          );
          
          // If all first three substeps are completed, unlock the review step
          if (allFirstThreeCompleted) {
            console.log('All first three substeps are completed');
            const reviewStepIndex = updatedWorkflowSteps[currentStepIndex].subSteps.findIndex(
              subStep => subStep.id === 'review'
            );
            
            if (reviewStepIndex !== -1) {
              updatedWorkflowSteps[currentStepIndex].subSteps[reviewStepIndex].status = 'pending';
              
              // Also update in Firestore
              await db.collection('applications').doc(applicationId).update({
                'stepStatuses.review': 'pending',
                updatedAt: new Date()
              });
              
              // Update local state for review step
              setStepStatuses(prev => ({
                ...prev,
                'review': 'pending'
              }));
            }
          }
          
          // If there's a next substep, set it as the selected one
          if (subStepIndex < updatedWorkflowSteps[currentStepIndex].subSteps.length - 1) {
            const nextSubStep = updatedWorkflowSteps[currentStepIndex].subSteps[subStepIndex + 1];
            setSelectedSubStep(nextSubStep.id);
          }
        }
      }
      
      setWorkflowSteps(updatedWorkflowSteps);
    } catch (error) {
      console.error('Error in handleDocumentsConfirm:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'locked':
        return 'gray';
      case 'pending':
        return 'blue';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <MdCheckCircle size={20} />;
      case 'locked':
        return <MdLock size={20} />;
      case 'pending':
        return <MdHourglassEmpty size={20} />;
      case 'error':
        return <MdError size={20} />;
      default:
        return null;
    }
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
        {loading ? (
          <Spinner />
        ) : selectedSubStep === 'applicant-info' ? (
          <ApplicantInfoForm
            profileData={profileData}
            onConfirm={handleApplicantInfoConfirm}
            onNext={() => setSelectedSubStep('parcel-details')}
            applicationId={applicationId}
            isCompleted={stepStatuses['applicant-info'] === 'completed'}
          />
        ) : selectedSubStep === 'parcel-details' ? (
          <ParcelDetailsForm
            parcels={applicationData.parcelInfo}
            onConfirm={handleParcelDetailsConfirm}
            onNext={() => setSelectedSubStep('documents')}
            applicationId={applicationId}
            isCompleted={stepStatuses['parcel-details'] === 'completed'}
            actionType={selectedAction}
          />
        ) : selectedSubStep === 'documents' ? (
          <DocumentUploadForm
            onConfirm={handleDocumentsConfirm}
            onNext={() => setSelectedSubStep('review')}
            applicationId={applicationId}
            isCompleted={stepStatuses['documents'] === 'completed'}
            actionType={selectedAction}
          />
        ) : selectedSubStep === 'review' ? (
          <ReviewSubmitForm
            applicationId={applicationId}
            onSubmit={handleFinalSubmit}
            isCompleted={stepStatuses['review'] === 'completed'}
            actionType={selectedAction}
          />
        ) : (
          <Text>Form content for: {selectedSubStep}</Text>
        )}
      </Box>
    );
  };

  // Add this new function to determine the current substep
  const determineCurrentSubStep = (stepStatuses) => {
    // Define the order of substeps
    const subStepOrder = ['applicant-info', 'parcel-details', 'documents', 'review'];
    
    // If no step statuses, return the first step
    if (!stepStatuses || Object.keys(stepStatuses).length === 0) {
      return 'applicant-info';
    }
    
    // Find the first incomplete step
    for (const step of subStepOrder) {
      if (!stepStatuses[step] || stepStatuses[step] !== 'completed') {
        return step;
      }
    }
    
    // If all steps are completed, return the review step
    return 'review';
  };

  // Add this function to check and update review step status
  const checkAndUpdateReviewStatus = (updatedWorkflowSteps) => {
    const submitAppStepIndex = updatedWorkflowSteps.findIndex(step => 
      step.title === 'Submit Application'
    );
    
    if (submitAppStepIndex !== -1) {
      const firstThreeSubsteps = updatedWorkflowSteps[submitAppStepIndex].subSteps.slice(0, 3);
      const allFirstThreeCompleted = firstThreeSubsteps.every(
        subStep => subStep.status === 'completed'
      );
      
      if (allFirstThreeCompleted) {
        const reviewStepIndex = updatedWorkflowSteps[submitAppStepIndex].subSteps.findIndex(
          subStep => subStep.id === 'review'
        );
        
        if (reviewStepIndex !== -1 && 
            updatedWorkflowSteps[submitAppStepIndex].subSteps[reviewStepIndex].status === 'locked') {
          updatedWorkflowSteps[submitAppStepIndex].subSteps[reviewStepIndex].status = 'pending';
        }
      }
    }
    
    return updatedWorkflowSteps;
  };

  // Add this new handler for final submission
  const handleFinalSubmit = async (applicationId) => {
    try {
      console.log('Starting handleFinalSubmit');
      console.log('Application ID:', applicationId);
      
      // Update application status to submitted
      await db.collection('applications').doc(applicationId).update({
        status: 'submitted',
        updatedAt: new Date(),
        'stepStatuses.review': 'completed'
      });

      console.log('Successfully updated application status to submitted');

      // Update local state
      setStepStatuses(prev => ({
        ...prev,
        'review': 'completed'
      }));
      
      // Update the workflow steps to mark the current substep as completed
      const updatedWorkflowSteps = [...workflowSteps];
      const currentStepIndex = updatedWorkflowSteps.findIndex(step => 
        step.subSteps.some(subStep => subStep.id === 'review')
      );
      
      if (currentStepIndex !== -1) {
        const subStepIndex = updatedWorkflowSteps[currentStepIndex].subSteps.findIndex(
          subStep => subStep.id === 'review'
        );
        
        if (subStepIndex !== -1) {
          updatedWorkflowSteps[currentStepIndex].subSteps[subStepIndex].status = 'completed';
          
          // Mark the entire first step as completed
          updatedWorkflowSteps[currentStepIndex].status = 'completed';
          
          // Unlock the next main step (Township Review)
          if (currentStepIndex + 1 < updatedWorkflowSteps.length) {
            updatedWorkflowSteps[currentStepIndex + 1].status = 'pending';
          }
        }
      }
      
      setWorkflowSteps(updatedWorkflowSteps);
      
      // Show success message
      toaster.success({
        title: "Application Submitted",
        description: "Your application has been successfully submitted for review."
      });
      
    } catch (error) {
      console.error('Error in handleFinalSubmit:', error);
      console.error('Error stack:', error.stack);
      
      toaster.error({
        title: "Error Submitting Application",
        description: error.message
      });
      
      throw error;
    }
  };

  return (
    <Box p={4} color={textColor} minH="90vh">
      <Heading size="lg" mb={6} color={textColor}>
        {selectedAction || 'New'} Application
      </Heading>
      
      {/* Add action type selection if not already set */}
      {(!selectedAction || selectedAction === 'unknown') && (
        <Box mb={6} p={4} borderWidth="1px" borderRadius="md" bg={bgColor}>
          <Heading size="md" mb={4}>Select Application Type</Heading>
          <Stack direction="row" spacing={4}>
            <Button 
              colorScheme="blue" 
              onClick={() => updateActionType('Split')}
            >
              Split
            </Button>
            <Button 
              colorScheme="green" 
              onClick={() => updateActionType('Combination')}
            >
              Combination
            </Button>
            <Button 
              colorScheme="purple" 
              onClick={() => updateActionType('Boundary Line Adjustment')}
            >
              Boundary Line Adjustment
            </Button>
          </Stack>
        </Box>
      )}
      
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
          <Box >
            <Heading size="md" mb={4}>
              {workflowSteps[currentMainStep].title} Details
            </Heading>
            <List.Root >
              {workflowSteps[currentMainStep].subSteps.map((subStep, index) => (
                <List.Item
                  key={index}
                  p={3}
                  m={2}
                  cursor={subStep.isClickable ? 'pointer' : 'default'}
                  bg={selectedSubStep === subStep.id ? `${bgColor}` : 'transparent'}
                  _hover={subStep.isClickable ? { bg: `${bgColor}` } : {}}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor={borderColor}
                  onClick={() => handleSubStepClick(currentMainStep, subStep)}
                >
                  <Stack direction="row" align="center" justify="space-between">
                    <Stack direction="row" align="center" spacing={2}>
                      <Box color={getStatusColor(subStep.status)}>
                        {getStatusIcon(subStep.status)}
                      </Box>
                      <Text>{subStep.title}</Text>
                    </Stack>
                    {subStep.status && (
                      <Text
                        fontSize="sm"
                        color={getStatusColor(subStep.status)}
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