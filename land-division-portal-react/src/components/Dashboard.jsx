import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ApplicationList from './dashboard/ApplicationList';
import ApplicationDetail from './dashboard/ApplicationDetail';
import NewApplicationForm from './dashboard/NewApplicationForm';
import ParcelSearch from './dashboard/ParcelSearch';
import Sidebar from './dashboard/Sidebar';
import ParcelDetail from './dashboard/ParcelDetail';
import { 
  Box, 
  Flex, 
  Heading, 
  VStack,
} from '@chakra-ui/react';
import { MdExpandLess, MdExpandMore } from 'react-icons/md';
import { useTheme } from 'next-themes';
import ApplicationWizard from './ApplicationWizard';
import { useLocation } from 'react-router-dom';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [viewMode, setViewMode] = useState('list');
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [selectedParcelId, setSelectedParcelId] = useState(null);
  const [isApplicationsCollapsed, setIsApplicationsCollapsed] = useState(false);
  const [isParcelsCollapsed, setIsParcelsCollapsed] = useState(false);
  const [autoFillData, setAutoFillData] = useState(null);
  const [selectedParcels, setSelectedParcels] = useState([]);
  const [selectedAction, setSelectedAction] = useState(null);

  // Theme integration
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? 'whiteAlpha.900' : 'gray.800';
  const sidebarBorderColor = theme === 'dark' ? 'gray.600' : 'gray.200';
  const mainBg = theme === 'dark' ? 'gray.900' : 'gray.50';

  const location = useLocation();

  // Check for URL parameters to reset view
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const viewParam = params.get('view');
    
    if (viewParam === 'list') {
      setViewMode('list');
      setSelectedApplicationId(null);
      setSelectedParcelId(null);
      setSelectedParcels([]);
      setSelectedAction(null);
    }
  }, [location]);

  const handleApplicationClick = (applicationId) => {
    setSelectedApplicationId(applicationId);
    setViewMode('wizard');
  };

  const handleNewApplication = (additionalData = null) => {
    setAutoFillData(additionalData);
    setViewMode('new');
    setSelectedApplicationId(null);
  };

  const handleParcelClick = (parcelId) => {
    setSelectedParcelId(parcelId);
    setViewMode('parcelDetail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedApplicationId(null);
    setSelectedParcelId(null);
  };

  const handleStartApplication = (parcels, actionType) => {
    setSelectedParcels(parcels);
    setSelectedAction(actionType);
    setViewMode('wizard');
  };

  const handleCancelApplication = () => {
    setViewMode('list');
    setSelectedParcels([]);
    setSelectedAction(null);
  };

  const handleSelectSubStep = (subStepId) => {
    console.log('Selected sub-step:', subStepId);
  };

  const renderMainContent = () => {
    switch (viewMode) {
      case 'wizard':
        return (
          <ApplicationWizard 
            selectedParcels={selectedParcels}
            actionType={selectedAction}
            onCancel={handleBackToList}
            onSelectSubStep={handleSelectSubStep}
            existingApplicationId={selectedApplicationId}
            isEditMode={!!selectedApplicationId}
          />
        );
      case 'parcelDetail':
        return (
          <ParcelDetail 
            parcelId={selectedParcelId}
            onBack={handleBackToList}
          />
        );
      case 'new':
        return (
          <NewApplicationForm 
            onBack={handleBackToList}
            additionalAutoFillData={autoFillData}
          />
        );
      case 'list':
      default:
        return (
          <VStack spacing={6} align="stretch">
            {/* Applications Section */}
            <Box borderWidth="1px" borderRadius="md" p={4}>
              <Flex
                align="center"
                justify="space-between"
                cursor="pointer"
                onClick={() =>
                  setIsApplicationsCollapsed(!isApplicationsCollapsed)
                }
              >
                <Heading size="md">Applications</Heading>
                {isApplicationsCollapsed ? (
                  <MdExpandMore size={24} />
                ) : (
                  <MdExpandLess size={24} />
                )}
              </Flex>
              {!isApplicationsCollapsed && (
                <Box mt={4}>
                  <ApplicationList
                    onApplicationClick={handleApplicationClick}
                  />
                </Box>
              )}
            </Box>
            {/* Parcels Section */}
            <Box borderWidth="1px" borderRadius="md" p={4}>
              <Flex
                align="center"
                justify="space-between"
                cursor="pointer"
                onClick={() => setIsParcelsCollapsed(!isParcelsCollapsed)}
              >
                <Heading size="md">Parcels</Heading>
                {isParcelsCollapsed ? (
                  <MdExpandMore size={24} />
                ) : (
                  <MdExpandLess size={24} />
                )}
              </Flex>
              {!isParcelsCollapsed && (
                <Box mt={4}>
                  <ParcelSearch
                    onParcelSelect={handleParcelClick}
                    onStartApplication={handleStartApplication}
                  />
                </Box>
              )}
            </Box>
          </VStack>
        );
    }
  };

  return (
    <Flex minH="100vh" bg={mainBg} color={textColor}>
      {/* Sidebar */}
      <Box w="300px" borderRightWidth="1px" borderColor={sidebarBorderColor} p={4}>
        <Sidebar />
      </Box>
      {/* Main Content */}
      <Box  p={4} w="50vw" justifyContent="center" margin="auto">
        {renderMainContent()}
      </Box>
    </Flex>
  );
};

export default Dashboard;
