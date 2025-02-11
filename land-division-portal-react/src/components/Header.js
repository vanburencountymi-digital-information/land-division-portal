import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate('/landing');
  };

  const handleNavigateHome = () => {
    navigate('/landing');
  };

  return (
    <header className="bg-primary p-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold">Land Division Portal</h1>
        <nav>
          <button 
            onClick={handleNavigateHome}
            className="px-4 py-2 hover:bg-opacity-80"
          >
            Home
          </button>
          <button 
            onClick={() => navigate('/applications')}
            className="px-4 py-2 hover:bg-opacity-80"
          >
            Applications
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {currentUser ? (
          <>
            <span>Welcome, {currentUser.email}</span>
            <button 
              onClick={handleSignOut}
              className="px-4 py-2 bg-secondary hover:bg-opacity-80 rounded"
            >
              Sign Out
            </button>
          </>
        ) : (
          <button 
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-secondary hover:bg-opacity-80 rounded"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
