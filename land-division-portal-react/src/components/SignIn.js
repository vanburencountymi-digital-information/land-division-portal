import React from "react";
import AuthUI from "./AuthUI"; // your existing AuthUI component
import "../styles/LandingPage.css"; // styles specific to your landing page

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <h1>Van Buren County Land Division Portal</h1>
        <p>Welcome to the Van Buren County Land Division Portal! Please sign in to continue.</p>
      </header>
      <div className="auth-container">
        <AuthUI />
      </div>
      <footer className="landing-footer">
        <p>&copy; 2025 Your Company</p>
      </footer>
    </div>
  );
};

export default LandingPage;
