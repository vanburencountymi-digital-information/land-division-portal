import React, { useState, useCallback, useEffect, memo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../utils/roles';
import { db } from '../firebase/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import {
    ReactFlow,
    Controls,
    Background,
    applyEdgeChanges,
    applyNodeChanges,
    addEdge,
    Handle,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Custom Node Component
const ApprovalNode = memo(({ data, isConnectable }) => {
    return (
        <div style={{
            padding: '10px',
            borderRadius: '5px',
            background: 'white',
            border: '1px solid #777',
            minWidth: '150px'
        }}>
            <div style={{ marginBottom: '8px' }}>{data.label}</div>
            {data.email && (
                <div style={{ 
                    fontSize: '12px',
                    color: '#666',
                    wordBreak: 'break-all'
                }}>
                    Approver: {data.email}
                </div>
            )}
            <div style={{ 
                position: 'absolute',
                left: '-8px',
                top: '50%',
                transform: 'translateY(-50%)'
            }}>
                <Handle type="target" position="left" isConnectable={isConnectable} />
            </div>
            <div style={{
                position: 'absolute',
                right: '-8px',
                top: '50%',
                transform: 'translateY(-50%)'
            }}>
                <Handle type="source" position="right" isConnectable={isConnectable} />
            </div>
        </div>
    );
});

const WorkflowDesigner = () => {
    const { userRole } = useAuth();
    const [workflows, setWorkflows] = useState([]);
    const [workflowName, setWorkflowName] = useState('');
    const [selectedNode, setSelectedNode] = useState(null);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [tempEmail, setTempEmail] = useState('');
    
    // Initial nodes state
    const [nodes, setNodes] = useState([
        {
            id: '1',
            type: 'input',
            data: { label: 'Application Submitted' },
            position: { x: 250, y: 25 },
        },
    ]);
    
    // Initial edges state
    const [edges, setEdges] = useState([]);

    // Handle node changes
    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    // Handle edge changes
    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    // Handle new connections
    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        []
    );

    // Handle node click
    const onNodeClick = useCallback((event, node) => {
        // Don't allow editing start node
        if (node.type === 'input') return;
        
        setSelectedNode(node);
        setTempEmail(node.data.email || '');
        setShowEmailModal(true);
    }, []);

    // Handle email update
    const handleEmailUpdate = useCallback(() => {
        if (!selectedNode) return;

        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === selectedNode.id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            email: tempEmail
                        }
                    };
                }
                return node;
            })
        );
        setShowEmailModal(false);
        setSelectedNode(null);
        setTempEmail('');
    }, [selectedNode, tempEmail]);

    // Update handleAddNode to use custom node type
    const handleAddNode = useCallback(() => {
        const newNode = {
            id: `${nodes.length + 1}`,
            type: 'approvalNode', // Custom node type
            data: { 
                label: `Approval Step ${nodes.length}`,
                email: '' // Initialize empty email
            },
            position: { x: 250, y: (nodes.length * 100) + 50 },
        };
        setNodes((nds) => [...nds, newNode]);
    }, [nodes]);

    // Load existing workflows
    useEffect(() => {
        const loadWorkflows = async () => {
            const workflowsCollection = collection(db, 'workflows');
            const workflowSnapshot = await getDocs(workflowsCollection);
            const workflowList = workflowSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setWorkflows(workflowList);
        };
        
        loadWorkflows();
    }, []);

    // Save workflow handler
    const handleSaveWorkflow = async () => {
        if (!workflowName.trim()) {
            alert('Please enter a workflow name');
            return;
        }

        try {
            const workflowData = {
                name: workflowName.trim(),
                nodes,
                edges,
                createdAt: new Date(),
                createdBy: userRole,
            };

            const workflowsRef = collection(db, 'workflows');
            await addDoc(workflowsRef, workflowData);
            
            // Refresh the workflows list
            const workflowSnapshot = await getDocs(workflowsRef);
            const workflowList = workflowSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setWorkflows(workflowList);
            
            // Clear the workflow name input
            setWorkflowName('');
            alert('Workflow saved successfully!');
        } catch (error) {
            console.error('Error saving workflow:', error);
            alert('Error saving workflow');
        }
    };

    // Load workflow handler
    const handleLoadWorkflow = (workflow) => {
        setNodes(workflow.nodes);
        setEdges(workflow.edges);
    };

    // Add delete workflow handler
    const handleDeleteWorkflow = async (workflowId, event) => {
        // Stop the click event from bubbling up to the parent button
        // (which would trigger handleLoadWorkflow)
        event.stopPropagation();
        
        if (window.confirm('Are you sure you want to delete this workflow?')) {
            try {
                const workflowRef = doc(db, 'workflows', workflowId);
                await deleteDoc(workflowRef);
                
                // Update the workflows list
                setWorkflows(workflows.filter(w => w.id !== workflowId));
                alert('Workflow deleted successfully');
            } catch (error) {
                console.error('Error deleting workflow:', error);
                alert('Error deleting workflow');
            }
        }
    };

    // Add nodeTypes configuration
    const nodeTypes = {
        approvalNode: ApprovalNode,
    };

    return (
        <div style={{
            padding: '20px',
            maxWidth: '1200px',
            margin: '0 auto'
        }}>
            <h1 style={{
                fontSize: '24px',
                marginBottom: '20px'
            }}>
                Workflow Designer
            </h1>

            <div style={{
                backgroundColor: '#f5f5f5',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px'
            }}>
                <h2 style={{
                    fontSize: '18px',
                    marginBottom: '10px'
                }}>
                    Current Role: {userRole}
                </h2>
                <p>
                    {userRole === ROLES.TOWNSHIP && "Township View - Design approval workflows for your jurisdiction"}
                    {userRole === ROLES.ADDRESS_ADMINISTRATOR && "Address Administrator View - Design address validation workflows"}
                    {userRole === ROLES.ADMIN && "Admin View - Design and manage all workflow types"}
                </p>
            </div>

            <div style={{
                height: '500px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                backgroundColor: '#fff'
            }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    nodeTypes={nodeTypes}
                    fitView
                >
                    <Background />
                    <Controls />
                </ReactFlow>
            </div>

            <div style={{
                marginTop: '20px',
                display: 'flex',
                gap: '10px',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <input
                    type="text"
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    placeholder="Enter workflow name"
                    style={{
                        padding: '10px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        width: '200px'
                    }}
                />
                <button
                    onClick={handleAddNode}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#0066cc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Add Node
                </button>
                <button 
                    onClick={handleSaveWorkflow}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Save Workflow
                </button>
            </div>

            {/* Update Workflow List display */}
            <div style={{
                marginTop: '20px',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
            }}>
                <h3 style={{ marginBottom: '10px' }}>Saved Workflows:</h3>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                }}>
                    {workflows.map((workflow) => (
                        <button
                            key={workflow.id}
                            onClick={() => handleLoadWorkflow(workflow)}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#f0f0f0',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                position: 'relative',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <div>
                                <strong>{workflow.name}</strong>
                                <br />
                                Created on: {workflow.createdAt.toDate().toLocaleDateString()}
                                {' - '}
                                By: {workflow.createdBy}
                            </div>
                            <button
                                onClick={(e) => handleDeleteWorkflow(workflow.id, e)}
                                style={{
                                    padding: '4px 8px',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    marginLeft: '10px'
                                }}
                            >
                                Delete
                            </button>
                        </button>
                    ))}
                </div>
            </div>

            <div style={{
                marginTop: '20px',
                padding: '20px',
                backgroundColor: '#e9ecef',
                borderRadius: '8px'
            }}>
                <h3 style={{ marginBottom: '10px' }}>Development Notes:</h3>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                    <li>React Flow will be implemented here</li>
                    <li>Different node types will represent approval steps</li>
                    <li>Firebase Cloud Functions will handle email notifications</li>
                    <li>Workflows will be stored in Firestore</li>
                </ul>
            </div>

            {/* Email Modal */}
            {showEmailModal && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    zIndex: 1000
                }}>
                    <h3 style={{ marginBottom: '15px' }}>Configure Approver Email</h3>
                    <input
                        type="email"
                        value={tempEmail}
                        onChange={(e) => setTempEmail(e.target.value)}
                        placeholder="Enter approver's email"
                        style={{
                            padding: '8px',
                            marginBottom: '15px',
                            width: '100%',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    />
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button
                            onClick={() => setShowEmailModal(false)}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleEmailUpdate}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Save
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkflowDesigner;