import { Route, Routes } from 'react-router-dom';
import './App.css';
import AuthUI from './components/AuthUI';
import Dashboard from './components/Dashboard.js';
import PrivateRoute from './components/PrivateRoute.js'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<AuthUI />} />
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
