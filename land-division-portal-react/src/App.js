import { Route, Routes } from 'react-router-dom';
import './App.css';
import LandingPage from './components/LandingPage.js';
import Dashboard from './components/Dashboard.js';
import PrivateRoute from './components/PrivateRoute.js'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } 
        />
      </Routes>
    </div>
  );
}

export default App;
