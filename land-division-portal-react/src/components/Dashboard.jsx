import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ApplicationList from './dashboard/ApplicationList';
import ApplicationDetail from './dashboard/ApplicationDetail';
import NewApplicationForm from './dashboard/NewApplicationForm';
import Sidebar from './dashboard/Sidebar';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [viewMode, setViewMode] = useState('list');
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);

  const handleApplicationClick = (applicationId) => {
    setSelectedApplicationId(applicationId);
    setViewMode('detail');
  };

  const handleNewApplication = () => {
    setViewMode('new');
    setSelectedApplicationId(null);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedApplicationId(null);
  };

  const renderMainContent = () => {
    switch (viewMode) {
      case 'detail':
        return (
          <ApplicationDetail 
            applicationId={selectedApplicationId}
            onBack={handleBackToList}
          />
        );
      case 'new':
        return (
          <NewApplicationForm 
            onBack={handleBackToList}
          />
        );
      case 'list':
      default:
        return (
          <ApplicationList
            onApplicationClick={handleApplicationClick}
            onNewApplication={handleNewApplication}
          />
        );
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <Sidebar />
      </div>
      <div className="dashboard-main">
        {renderMainContent()}
      </div>
    </div>
  );
};

export default Dashboard;