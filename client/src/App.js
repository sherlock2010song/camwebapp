import React, { useContext, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Camera from './pages/Camera';
import History from './pages/History';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

// Components
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// Styles
import './App.css';

function App() {
  const { loadUser, isAuthenticated, loading, user } = useContext(AuthContext);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {isAuthenticated && <Navbar />}
      <div className="container">
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
          
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/camera" element={<PrivateRoute><Camera /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
