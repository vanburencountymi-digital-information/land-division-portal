import { Route, Routes } from 'react-router-dom';
import './App.css';
import AuthUI from './components/AuthUI';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<AuthUI />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}

export default App;
