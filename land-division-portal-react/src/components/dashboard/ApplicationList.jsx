import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/firebase';

const ApplicationList = ({ onApplicationClick, onNewApplication }) => {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const applicationsRef = db.collection('applications');
        const snapshot = await applicationsRef
          .where('applicantId', '==', currentUser.uid)
          .orderBy('createdAt', 'desc')
          .get();

        const applicationData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setApplications(applicationData);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [currentUser]);

  if (loading) {
    return <div className="loading">Loading your applications...</div>;
  }

  return (
    <div className="applications-container">
      <div className="applications-header">
        <h2>My Applications</h2>
        <button
          className="new-application-button"
          onClick={onNewApplication}
        >
          Start a New Application
        </button>
      </div>

      {applications.length === 0 ? (
        <div className="no-applications">
          <p>You haven't submitted any applications yet.</p>
          <p>Click "Start a New Application" to begin.</p>
        </div>
      ) : (
        <div className="applications-list">
          {applications.map(application => (
            <div
              key={application.id}
              className="application-card"
              onClick={() => onApplicationClick(application.id)}
            >
              <div className="application-info">
                <h3>{application.type || 'Land Division Application'}</h3>
                <p className="application-status">
                  Status: {application.status || 'Pending'}
                </p>
                <p className="application-date">
                  Submitted: {application.createdAt?.toDate().toLocaleDateString()}
                </p>
              </div>
              <div className="application-arrow">→</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationList;