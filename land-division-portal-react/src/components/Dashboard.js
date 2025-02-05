import React from 'react';

// Dummy application data
const dummyApplications = [
  { id: '1', name: 'Application One', status: 'In Progress' },
  { id: '2', name: 'Application Two', status: 'Submitted' },
  { id: '3', name: 'Application Three', status: 'Approved' },
];

// A simple mock status tracker component
const StatusTracker = ({ status }) => {
  // Return a color based on the application's status
  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return 'orange';
      case 'Submitted':
        return 'blue';
      case 'Approved':
        return 'green';
      default:
        return 'grey';
    }
  };

  const style = {
    padding: '10px',
    border: `2px solid ${getStatusColor(status)}`,
    borderRadius: '5px',
    display: 'inline-block',
    minWidth: '150px',
    textAlign: 'center'
  };

  return (
    <div style={style}>
      <h4>Status</h4>
      <p>{status}</p>
    </div>
  );
};

const Dashboard = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Your Applications</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {dummyApplications.map(app => (
          <li
            key={app.id}
            style={{
              marginBottom: '20px',
              border: '1px solid #ddd',
              padding: '15px',
              borderRadius: '5px'
            }}
          >
            <h3>{app.name}</h3>
            <StatusTracker status={app.status} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
