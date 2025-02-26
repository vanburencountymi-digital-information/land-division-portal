import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../utils/roles';
import { db } from '../firebase/firebase';
import { 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    onSnapshot,
    doc as firestoreDoc,
    getDoc
} from 'firebase/firestore';

const WorkflowTester = () => {
    const { userRole } = useAuth();
    const [testApplications, setTestApplications] = useState([]);
    const [selectedApp, setSelectedApp] = useState(null);
    const [loading, setLoading] = useState(false);

    // Listen for test applications - moved before the conditional return
    useEffect(() => {
        // Only set up the listener if user is admin
        if (userRole !== ROLES.ADMIN) return;

        const q = query(
            collection(db, 'applications'),
            orderBy('applicationData.submittedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const apps = [];
            snapshot.forEach((doc) => {
                apps.push({ id: doc.id, ...doc.data() });
            });
            setTestApplications(apps);
        });

        return () => unsubscribe();
    }, [userRole]);

    // Only allow admins to access this component
    if (userRole !== ROLES.ADMIN) {
        return (
            <div style={{ padding: '20px' }}>
                <h2>Unauthorized Access</h2>
                <p>Only administrators can access the workflow tester.</p>
            </div>
        );
    }

    // Create new test application
    const handleCreateTest = async () => {
        try {
            setLoading(true);
            const triggerDoc = await addDoc(collection(db, 'testTriggers'), {
                description: `Test workflow created at ${new Date().toLocaleString()}`
            });
            
            // Wait for the application ID to be added to the trigger document
            const unsubscribe = onSnapshot(
                firestoreDoc(db, 'testTriggers', triggerDoc.id), 
                async (doc) => {
                    if (doc.data()?.testApplicationId) {
                        const appDoc = await getDoc(
                            firestoreDoc(db, 'applications', doc.data().testApplicationId)
                        );
                        setSelectedApp({ id: appDoc.id, ...appDoc.data() });
                        unsubscribe();
                        setLoading(false);
                    }
                }
            );
        } catch (error) {
            console.error('Error creating test:', error);
            setLoading(false);
            alert('Error creating test application');
        }
    };

    // Submit approval action
    const handleApproval = async (action) => {
        if (!selectedApp) return;

        try {
            setLoading(true);
            const currentStep = selectedApp.workflow[selectedApp.currentNode];
            
            // Handle start nodes automatically
            if (currentStep.type === 'start') {
                await addDoc(collection(db, 'approvals'), {
                    applicationId: selectedApp.id,
                    action: 'approve', // Start nodes can only be approved
                    comments: `Automatic approval of submission at ${new Date().toLocaleString()}`,
                    approverEmail: 'system@automatic.com' // Use a system email for automatic approvals
                });
            } else if (currentStep.approverEmail) {
                // Handle normal approval nodes
                await addDoc(collection(db, 'approvals'), {
                    applicationId: selectedApp.id,
                    action: action,
                    comments: `Test ${action} at ${new Date().toLocaleString()}`,
                    approverEmail: currentStep.approverEmail
                });
            } else {
                throw new Error(`Node "${currentStep.node}" has no approver email configured`);
            }
            
            setLoading(false);
        } catch (error) {
            console.error('Error submitting approval:', error);
            setLoading(false);
            alert(`Error submitting approval: ${error.message}`);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '20px' }}>Workflow Tester</h1>
            
            {/* Create Test Button */}
            <button
                onClick={handleCreateTest}
                disabled={loading}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#0066cc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    marginBottom: '20px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1
                }}
            >
                Create Test Application
            </button>

            {/* Selected Application Details */}
            {selectedApp && (
                <div style={{
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    <h2 style={{ marginBottom: '10px' }}>Selected Application</h2>
                    <p><strong>ID:</strong> {selectedApp.id}</p>
                    <p><strong>Status:</strong> {selectedApp.status}</p>
                    <p><strong>Current Node:</strong> {selectedApp.workflow[selectedApp.currentNode]?.node}</p>
                    <p><strong>Node Type:</strong> {selectedApp.workflow[selectedApp.currentNode]?.type}</p>
                    <p><strong>Current Approver:</strong> {selectedApp.workflow[selectedApp.currentNode]?.approverEmail || 'None'}</p>
                    <p><strong>Node Index:</strong> {selectedApp.currentNode} of {selectedApp.workflow.length - 1}</p>
                    
                    {/* Approval Actions */}
                    <div style={{ marginTop: '20px' }}>
                        <button
                            onClick={() => handleApproval('approve')}
                            disabled={
                                loading || 
                                selectedApp.workflow[selectedApp.currentNode]?.type === 'end' ||
                                (!selectedApp.workflow[selectedApp.currentNode]?.approverEmail && 
                                 selectedApp.workflow[selectedApp.currentNode]?.type !== 'start')
                            }
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                marginRight: '10px',
                                cursor: 'pointer',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {selectedApp.workflow[selectedApp.currentNode]?.type === 'start' 
                                ? 'Submit' 
                                : 'Approve'
                            }
                        </button>
                        <button
                            onClick={() => handleApproval('reject')}
                            disabled={loading || selectedApp.workflow[selectedApp.currentNode]?.type === 'end'}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Reject
                        </button>
                    </div>

                    {/* History */}
                    <div style={{ marginTop: '20px' }}>
                        <h3>History</h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {selectedApp.history?.map((entry, index) => (
                                <li key={index} style={{
                                    padding: '8px',
                                    borderBottom: '1px solid #dee2e6'
                                }}>
                                    <strong>{entry.node}</strong> - {entry.status || entry.action}
                                    <br />
                                    <small>{new Date(entry.timestamp.seconds * 1000).toLocaleString()}</small>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {selectedApp?.error && (
                        <div style={{
                            marginTop: '10px',
                            padding: '10px',
                            backgroundColor: '#ffebee',
                            borderRadius: '4px',
                            border: '1px solid #ffcdd2'
                        }}>
                            <strong>Error:</strong> {selectedApp.error.message}
                            <br />
                            <small>Occurred at: {new Date(selectedApp.error.timestamp.seconds * 1000).toLocaleString()}</small>
                        </div>
                    )}
                </div>
            )}

            {/* All Test Applications */}
            <div>
                <h2 style={{ marginBottom: '10px' }}>All Test Applications</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {testApplications.map((app) => (
                        <button
                            key={app.id}
                            onClick={() => setSelectedApp(app)}
                            style={{
                                padding: '10px',
                                backgroundColor: selectedApp?.id === app.id ? '#e2e6ea' : '#f8f9fa',
                                border: '1px solid #dee2e6',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                textAlign: 'left'
                            }}
                        >
                            <strong>ID: {app.id}</strong>
                            <br />
                            Status: {app.status}
                            <br />
                            Current Step: {app.workflow[app.currentNode]?.node}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WorkflowTester;
