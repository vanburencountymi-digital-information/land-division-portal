import { Route, Routes } from 'react-router-dom';
import './App.css';
import SignIn from './components/SignIn.js';
import Dashboard from './components/Dashboard.jsx';
import LandingPage from './components/LandingPage';
import Profile from './components/Profile';
import PrivateRoute from './components/PrivateRoute.js';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route path="/landing"
          element={
            <PrivateRoute>
              <LandingPage />
            </PrivateRoute>
          }
        />
        <Route path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;