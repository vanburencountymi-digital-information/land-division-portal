import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { currentUser } = useAuth();

  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <h3>Land Division Guide</h3>
      </div>

      <div className="sidebar-content">
        <section className="sidebar-section">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <a href="#" onClick={(e) => e.preventDefault()}>
                Land Division FAQ
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => e.preventDefault()}>
                Application Requirements
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => e.preventDefault()}>
                Fee Schedule
              </a>
            </li>
          </ul>
        </section>

        <section className="sidebar-section">
          <h4>Process Overview</h4>
          <div className="process-steps">
            <div className="process-step">
              <span className="step-number">1</span>
              <p>Submit Application</p>
            </div>
            <div className="process-step">
              <span className="step-number">2</span>
              <p>Initial Review</p>
            </div>
            <div className="process-step">
              <span className="step-number">3</span>
              <p>Technical Analysis</p>
            </div>
            <div className="process-step">
              <span className="step-number">4</span>
              <p>Decision</p>
            </div>
          </div>
        </section>

        <section className="sidebar-section">
          <h4>Need Help?</h4>
          <p>Contact our support team:</p>
          <p>📧 support@example.com</p>
          <p>📞 (555) 123-4567</p>
        </section>
      </div>
    </div>
  );
};

export default Sidebar;