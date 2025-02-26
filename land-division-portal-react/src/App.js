import { Route, Routes } from 'react-router-dom';
import './App.css';
import SignIn from './components/SignIn.js';
import Dashboard from './components/Dashboard.jsx';
import LandingPage from './components/LandingPage';
import Profile from './components/Profile';
import PrivateRoute from './components/PrivateRoute.js';
import Unauthorized from './components/Unauthorized';
import UserManagement from './components/UserManagement';
import SignUp from './components/SignUp';
import DefaultLayout from './components/layouts/DefaultLayout';
import WorkflowDesigner from './components/WorkflowDesigner';
import WorkflowTester from './components/WorkflowTester';
function App() {
  return (
    <div className="App">
      <DefaultLayout>
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/dashboard"
            element={
              <PrivateRoute requiredPermissions={['canViewDashboard']}>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route path="/landing"
            element={
              <PrivateRoute requiredPermissions={['canViewDashboard']}>
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
          <Route path="/workflow-designer"
            element={
              <PrivateRoute requiredPermissions={['canManageWorkflows']}>
                <WorkflowDesigner />
              </PrivateRoute>
            }
          />
          <Route path="/user-management"
            element={
              <PrivateRoute requiredPermissions={['canManageUsers']}>
                <UserManagement />
              </PrivateRoute>
            }
          />
          <Route path="/workflow-tester"
            element={
              <PrivateRoute requiredPermissions={['canManageWorkflows']}>
                <WorkflowTester />
              </PrivateRoute>
            }
          />
        </Routes>
      </DefaultLayout>
    </div>
  );
}

export default App;