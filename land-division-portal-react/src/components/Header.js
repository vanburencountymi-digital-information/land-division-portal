// Example: src/components/Header.js
import React from "react";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
  const { currentUser, logout } = useAuth();

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <header>
      {currentUser ? (
        <div>
          <span>Welcome, {currentUser.email}</span>
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      ) : (
        <span>You are not signed in</span>
      )}
    </header>
  );
};

export default Header;
