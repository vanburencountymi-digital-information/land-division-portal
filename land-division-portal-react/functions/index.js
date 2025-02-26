const admin = require("firebase-admin");
const {onDocumentCreated, onDocumentUpdated} = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const {onRequest} = require("firebase-functions/v2/https");

admin.initializeApp();

// Constants for safety limits
const MAX_UPDATES_PER_HOUR = 10;
const MAX_TOTAL_UPDATES = 20;

/**
 * Cloud Function: processWorkflow
 *
 * Handles the workflow progression for land division applications.
 * Triggers when an application document is created or updated.
 *
 * Expected document structure:
 * {
 *   workflow: [
 *     { node: "Submission", type: "start" },
 *     {
 *       node: "Township Review",
 *       type: "approval",
 *       approverEmail: "township@example.com",
 *       requirements: ["survey", "deed"]
 *     },
 *     // ... more nodes
 *   ],
 *   currentNode: 0,
 *   status: "Pending",
 *   applicationData: {
 *     applicantEmail: "user@example.com",
 *     propertyAddress: "123 Main St",
 *     // ... other application fields
 *   }
 * }
 */
exports.processWorkflow = onDocumentUpdated("applications/{appId}", async (event) => {
  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();
  const appId = event.params.appId;

  try {
    // Check for infinite loop prevention
    const now = admin.firestore.Timestamp.now();
    const oneHourAgo = admin.firestore.Timestamp.fromMillis(now.toMillis() - (60 * 60 * 1000));

    const updates = afterData.updates || {
      total: 0,
      recentUpdates: [],
      firstUpdate: now,
    };

    // Clean up old updates
    updates.recentUpdates = updates.recentUpdates.filter((timestamp) =>
      timestamp.toMillis() > oneHourAgo.toMillis(),
    );

    // Add current update
    updates.recentUpdates.push(now);
    updates.total = (updates.total || 0) + 1;

    // Check safety limits
    if (updates.recentUpdates.length > MAX_UPDATES_PER_HOUR) {
      logger.error(`Safety limit reached: Too many updates per hour for app ${appId}`);
      await event.data.after.ref.update({
        status: "ERROR: Too many updates per hour - possible infinite loop detected",
        error: {
          type: "SAFETY_LIMIT",
          message: "Too many updates per hour",
          timestamp: now,
        },
        updates,
      });
      return;
    }

    if (updates.total > MAX_TOTAL_UPDATES) {
      logger.error(`Safety limit reached: Maximum total updates exceeded for app ${appId}`);
      await event.data.after.ref.update({
        status: "ERROR: Maximum total updates exceeded",
        error: {
          type: "SAFETY_LIMIT",
          message: "Maximum total updates exceeded",
          timestamp: now,
        },
        updates,
      });
      return;
    }

    // Only process if currentNode has changed
    if (beforeData.currentNode === afterData.currentNode) {
      return;
    }

    const workflow = afterData.workflow || [];
    const currentNode = afterData.currentNode;
    const currentStep = workflow[currentNode];

    // Skip processing if workflow is invalid
    if (!workflow.length || !currentStep) {
      logger.error(`Invalid workflow configuration for app ${appId}`);
      return;
    }

    // Prepare base update data
    const updateData = {
      lastUpdated: now,
      updates, // Include the updates tracking
      history: admin.firestore.FieldValue.arrayUnion({
        node: currentStep.node,
        timestamp: now,
        status: "Started",
      }),
    };

    // Handle different node types
    switch (currentStep.type) {
      case "start":
        updateData.status = "Application Submitted";
        updateData.currentNode = currentNode + 1;
        break;

      case "approval":
        updateData.status = `Awaiting approval from ${currentStep.node}`;
        if (currentStep.approverEmail) {
          logger.info(`Would send email to ${currentStep.approverEmail} for app ${appId}`);
        }
        break;

      case "address":
        updateData.status = "Pending Address Validation";
        break;

      case "end":
        updateData.status = "Application Complete";
        updateData.completedAt = now;
        break;

      default:
        logger.warn(`Unknown node type for app ${appId}: ${currentStep.type}`);
        break;
    }

    // Update the application document
    await event.data.after.ref.update(updateData);
    logger.info(`Successfully processed node ${currentNode} for app ${appId}`);
  } catch (error) {
    logger.error("Error processing workflow:", error);

    // Update application with error status
    await event.data.after.ref.update({
      status: "Error processing workflow",
      error: {
        message: error.message,
        timestamp: admin.firestore.Timestamp.now(),
      },
    });
  }
});

/**
 * Cloud Function: handleApprovalAction
 *
 * Handles approval/rejection actions from authorized users.
 * Triggers when an approval document is created.
 *
 * Expected document structure:
 * {
 *   applicationId: "abc123",
 *   action: "approve" | "reject",
 *   comments: "Optional comments",
 *   approverEmail: "township@example.com"
 * }
 */
exports.handleApprovalAction = onDocumentCreated("approvals/{approvalId}", async (event) => {
  const approvalData = event.data.data();
  const {applicationId, action, comments, approverEmail} = approvalData;

  logger.info("Processing approval:", {
    applicationId,
    action,
    approverEmail,
  });

  try {
    // Get the application document
    const appRef = admin.firestore()
        .collection("applications")
        .doc(applicationId);

    const appDoc = await appRef.get();
    if (!appDoc.exists) {
      throw new Error("Application not found");
    }

    const appData = appDoc.data();
    const currentStep = appData.workflow[appData.currentNode];

    // Verify approver is authorized (skip for start nodes)
    if (currentStep.type !== "start" &&
        currentStep.approverEmail !== approverEmail) {
      throw new Error("Unauthorized approval attempt");
    }

    // Prepare the update
    const now = admin.firestore.Timestamp.now();
    const updateData = {
      lastUpdated: now,
      history: admin.firestore.FieldValue.arrayUnion({
        node: currentStep.node,
        action: action,
        approver: approverEmail,
        comments: comments,
        timestamp: now,
      }),
    };

    if (action === "approve") {
      // Move to next node if not at the end
      if (appData.currentNode < appData.workflow.length - 1) {
        updateData.currentNode = appData.currentNode + 1;
        const nextStep = appData.workflow[appData.currentNode + 1];
        updateData.status = `Awaiting ${nextStep.node}`;
      } else {
        updateData.status = "Application Complete";
        updateData.completedAt = now;
      }
    } else if (action === "reject") {
      updateData.status = "Rejected";
      updateData.rejectedAt = now;
      updateData.rejectionReason = comments;
    }

    logger.info("Updating application:", {
      id: applicationId,
      currentNode: updateData.currentNode,
      status: updateData.status,
    });

    await appRef.update(updateData);
  } catch (error) {
    logger.error("Error processing approval:", error);
    throw error;
  }
});

/**
 * Cloud Function: createTestApplication
 *
 * Creates a test application with a simple workflow for testing purposes.
 * Triggers when a document is created in the 'testTriggers' collection.
 *
 * To test: Create any document in the 'testTriggers' collection.
 * The function will create a new application with a basic workflow.
 */
exports.createTestApplication = onDocumentCreated("testTriggers/{triggerId}", async (event) => {
  try {
    // Create a simple test workflow
    const testWorkflow = {
      workflow: [
        {
          node: "Submission",
          type: "start",
        },
        {
          node: "Township Review",
          type: "approval",
          approverEmail: "test-township@example.com",
          requirements: ["survey", "deed"],
        },
        {
          node: "Address Validation",
          type: "address",
          approverEmail: "test-address@example.com",
        },
        {
          node: "Final Approval",
          type: "end",
        },
      ],
      currentNode: 0,
      status: "Pending",
      applicationData: {
        applicantEmail: "test-applicant@example.com",
        propertyAddress: "123 Test Street",
        submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      history: [],
    };

    // Create the test application
    const applicationRef = await admin.firestore()
        .collection("applications")
        .add(testWorkflow);

    logger.info(`Created test application with ID: ${applicationRef.id}`);

    // Update the trigger document with the test application ID
    await event.data.ref.update({
      testApplicationId: applicationRef.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return applicationRef.id;
  } catch (error) {
    logger.error("Error creating test application:", error);
    throw error;
  }
});

/**
 * HTTP Endpoint: handleEmailApproval
 *
 * Receives approval information parsed from emails and creates an approval document.
 *
 * Expected request body:
 * {
 *   applicationId: string,
 *   approverEmail: string,
 *   action: "approve" | "reject",
 *   comments?: string,
 *   emailMetadata?: {
 *     receivedAt: string,
 *     subject: string,
 *     // ... any other relevant email metadata
 *   }
 * }
 */
exports.handleEmailApproval = onRequest({
  cors: true, // Enable CORS if needed
  maxInstances: 10,
}, async (req, res) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    const {applicationId, approverEmail, action, comments, emailMetadata} = req.body;

    // Validate required fields
    if (!applicationId || !approverEmail || !action) {
      res.status(400).send({
        error: "Missing required fields",
        required: ["applicationId", "approverEmail", "action"],
      });
      return;
    }

    // Validate action type
    if (!["approve", "reject"].includes(action)) {
      res.status(400).send({
        error: "Invalid action type",
        allowedActions: ["approve", "reject"],
      });
      return;
    }

    // Create approval document
    const approvalDoc = {
      applicationId,
      approverEmail,
      action,
      comments: comments || "",
      emailMetadata,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: "email",
    };

    const approvalRef = await admin.firestore()
        .collection("approvals")
        .add(approvalDoc);

    logger.info("Created approval document from email", {
      approvalId: approvalRef.id,
      applicationId,
      approverEmail,
      action,
    });

    res.status(200).send({
      success: true,
      approvalId: approvalRef.id,
    });
  } catch (error) {
    logger.error("Error processing email approval:", error);
    res.status(500).send({
      error: "Internal server error",
      message: error.message,
    });
  }
});
