import React, { useEffect, useState } from 'react';
import { db } from '../../firebase/firebase';
import { Button, Box, Flex } from '@chakra-ui/react';

const ApplicationDetail = ({ applicationId, onBack, onEdit }) => {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplicationDetail = async () => {
      try {
        const docRef = db.collection('applications').doc(applicationId);
        const doc = await docRef.get();
        
        if (doc.exists) {
          setApplication({
            id: doc.id,
            ...doc.data()
          });
        } else {
          console.error('No such application!');
        }
      } catch (error) {
        console.error('Error fetching application:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationDetail();
  }, [applicationId]);

  if (loading) {
    return <div className="loading">Loading application details...</div>;
  }

  if (!application) {
    return (
      <div className="error-container">
        <p>Application not found</p>
        <button onClick={onBack}>Back to Applications</button>
      </div>
    );
  }

  return (
    <Box>
      <div className="application-detail-container">
        <div className="application-detail-header">
          <button className="back-button" onClick={onBack}>
            ← Back to Applications
          </button>
          <h2>Application Details</h2>
        </div>

        <div className="application-detail-content">
          <div className="detail-section">
            <h3>Application Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Type:</label>
                <span>{application.type || 'Land Division Application'}</span>
              </div>
              <div className="detail-item">
                <label>Status:</label>
                <span>{application.status || 'Pending'}</span>
              </div>
              <div className="detail-item">
                <label>Submitted:</label>
                <span>
                  {application.createdAt?.toDate().toLocaleDateString()}
                </span>
              </div>
              {/* Add more application details as needed */}
            </div>
          </div>

          {/* You can add more sections here for different aspects of the application */}
          
          <div className="detail-actions">
            {application && application.status === 'draft' && (
              <Button 
                colorScheme="blue" 
                onClick={() => onEdit(applicationId)}
              >
                Edit Application
              </Button>
            )}
            <button className="action-button" onClick={() => console.log('Download')}>
              Download PDF
            </button>
          </div>
        </div>
      </div>
      <Flex mt={4} justifyContent="space-between">
        <Button onClick={onBack} variant="outline">
          Back to List
        </Button>
        {application && application.status === 'draft' && (
          <Button 
            colorScheme="blue" 
            onClick={() => onEdit(applicationId)}
          >
            Edit Application
          </Button>
        )}
      </Flex>
    </Box>
  );
};

export default ApplicationDetail;