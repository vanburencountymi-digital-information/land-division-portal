import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  Alert,
  Heading,
  Input,
  Progress,
  Stack,
  Badge,
  Icon
} from '@chakra-ui/react';
import { MdCheckCircle, MdUpload, MdDelete, MdError } from "react-icons/md";
import { storage, uploadFile } from '../../firebase/firebase';
import { Field } from '../ui/field';
import { useTheme } from 'next-themes';
import { toaster } from '../ui/toaster';

const DocumentUploadForm = ({ 
  applicationId,
  onConfirm, 
  onNext,
  isCompleted = false,
  actionType
}) => {
  const { theme } = useTheme();
  const [documents, setDocuments] = useState({
    taxReleaseForm: null,
    proofOfOwnership: null,
    survey: null,
    // We can add conditional documents later based on municipality
  });
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [currentUploadType, setCurrentUploadType] = useState(null);
  
  // Define colors based on current theme
  const bgColor = theme === 'dark' ? 'gray.800' : 'gray.100';
  const textColor = theme === 'dark' ? 'whiteAlpha.900' : 'gray.800';
  const inputBg = theme === 'dark' ? 'gray.700' : 'white';

  // Check if all required documents are uploaded
  const allRequiredDocumentsUploaded = () => {
    const requiredDocs = ['taxReleaseForm', 'proofOfOwnership', 'survey'];
    return requiredDocs.every(docType => uploadedFiles[docType]);
  };

  const handleFileChange = (e, docType) => {
    if (e.target.files[0]) {
      setDocuments({
        ...documents,
        [docType]: e.target.files[0]
      });
    }
  };

  const handleUpload = async (docType) => {
    if (!documents[docType]) return;
    
    setIsUploading(true);
    setCurrentUploadType(docType);
    const file = documents[docType];
    const path = `applications/${applicationId}/documents/${docType}/${file.name}`;
    
    try {
      // Use the existing uploadFile utility function
      const metadata = await uploadFile(file, path);
      
      setUploadedFiles(prev => ({
        ...prev,
        [docType]: metadata
      }));
      
      setIsUploading(false);
      setCurrentUploadType(null);
      
      toaster.create({
        title: "Upload complete",
        description: `${file.name} has been uploaded successfully.`,
        type: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      setIsUploading(false);
      setCurrentUploadType(null);
      
      toaster.create({
        title: "Upload failed",
        description: error.message,
        type: "error",
        duration: 5000,
      });
    }
  };

  const handleDeleteFile = async (docType) => {
    try {
      if (uploadedFiles[docType]) {
        // Delete from storage
        const fileRef = storage.ref(uploadedFiles[docType].path);
        await fileRef.delete();
        
        // Update state
        const newUploadedFiles = { ...uploadedFiles };
        delete newUploadedFiles[docType];
        setUploadedFiles(newUploadedFiles);
        
        // Reset file input
        setDocuments(prev => ({
          ...prev,
          [docType]: null
        }));
        
        toaster.create({
          title: "File deleted",
          description: `${uploadedFiles[docType].name} has been removed.`,
          type: "info",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toaster.create({
        title: "Delete failed",
        description: error.message,
        type: "error",
        duration: 5000,
      });
    }
  };

  const handleSubmit = async () => {
    try {
      // Create document data to save to Firestore
      const documentData = {
        documents: uploadedFiles,
        updatedAt: new Date()
      };
      
      await onConfirm(applicationId, documentData);
      onNext(); // Move to next step in wizard
    } catch (error) {
      console.error('Error saving document information:', error);
      toaster.create({
        title: "Error saving documents",
        description: error.message,
        type: "error",
        duration: 5000,
      });
    }
  };

  const renderDocumentField = (docType, label, description) => {
    return (
      <Field 
        label={label}
        required
        helperText={description}
      >
        {uploadedFiles[docType] ? (
          <Box 
            p={3}
            borderWidth="1px"
            borderRadius="md"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" align="center">
              <Icon  color="green.500">
                <MdCheckCircle />
              </Icon>
              <Text>{uploadedFiles[docType].name}</Text>
              <Badge colorPalette="green">Uploaded</Badge>
            </Stack>
            <Button 
              size="sm" 
              colorPalette="red" 
              leftIcon={<MdDelete />}
              onClick={() => handleDeleteFile(docType)}
            >
              Remove
            </Button>
          </Box>
        ) : (
          <>
            <Stack direction="row" spacing={4} align="center">
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, docType)}
                disabled={isUploading}
                bg={inputBg}
              />
              <Button
                colorPalette="blue"
                leftIcon={<MdUpload />}
                onClick={() => handleUpload(docType)}
                isDisabled={!documents[docType] || isUploading}
                isLoading={isUploading && currentUploadType === docType}
              >
                Upload
              </Button>
            </Stack>
            {/* {isUploading && currentUploadType === docType && (
              <Progress isIndeterminate size="sm" colorPalette="blue" mt={2} />
            )} */}
          </>
        )}
      </Field>
    );
  };

  if (isCompleted) {
    return (
      <VStack spacing={6} align="stretch">
        <Alert.Root status="success">
          <Alert.Indicator />
          <Alert.Content>
            All required documents have been uploaded.
          </Alert.Content>
        </Alert.Root>
        
        <Heading size="md" mb={4}>Uploaded Documents</Heading>
        
        {Object.entries(uploadedFiles).map(([docType, fileData]) => (
          <Box 
            key={docType}
            p={3}
            borderWidth="1px"
            borderRadius="md"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" align="center">
              <Icon color="green.500">
                <MdCheckCircle />
              </Icon>
              <Text fontWeight="medium">
                {docType === 'taxReleaseForm' ? 'Tax Release Form' : 
                 docType === 'proofOfOwnership' ? 'Proof of Ownership' : 
                 docType === 'survey' ? 'Survey' : docType}
              </Text>
              <Badge colorPalette="green">Uploaded</Badge>
            </Stack>
            <Text fontSize="sm">{fileData.name}</Text>
          </Box>
        ))}
        
        <Button 
          mt={4} 
          colorPalette="blue" 
          onClick={onNext}
        >
          Continue to Next Step
        </Button>
      </VStack>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <Text>
        Please upload the required documents for your {actionType} application. 
        All documents must be in PDF, JPG, or PNG format.
      </Text>

      
      <Heading size="md" mb={4}>Required Documents</Heading>
      
      {/* Tax Release Form */}
      {renderDocumentField(
        'taxReleaseForm',
        'Tax Release Form',
        'A document from the tax office confirming all property taxes are paid and current.'
      )}
      
      {/* Proof of Ownership */}
      {renderDocumentField(
        'proofOfOwnership',
        'Proof of Ownership',
        'A deed or title showing current ownership of the property.'
      )}
      
      {/* Survey Plat */}
      {renderDocumentField(
        'survey',
        'Survey',
        `A certified survey showing the proposed ${actionType?.toLowerCase() || 'division'} of the property.`
      )}
      
      
      <Button
        mt={4}
        colorPalette="blue"
        onClick={handleSubmit}
        isDisabled={!allRequiredDocumentsUploaded() || isUploading}
      >
        Confirm & Continue
      </Button>
    </VStack>
  );
};

export default DocumentUploadForm;