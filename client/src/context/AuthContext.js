import React, { createContext, useState, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);

  // Register user
  const register = async (username, password) => {
    setError(null);
    
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const body = JSON.stringify({ username, password });

    try {
      const res = await axios.post('/api/auth/register', body, config);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      await loadUser();
    } catch (err) {
      localStorage.removeItem('token');
      setToken(null);
      setIsAuthenticated(false);
      setLoading(false);
      setUser(null);
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  // Login user
  const login = async (username, password) => {
    setError(null);
    setApprovalStatus(null);
    
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const body = JSON.stringify({ username, password });

    try {
      const res = await axios.post('/api/auth/login', body, config);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setIsAuthenticated(true);
      setLoading(false);
      
      if (res.data.user.approvalStatus) {
        setApprovalStatus(res.data.user.approvalStatus);
      }
    } catch (err) {
      localStorage.removeItem('token');
      setToken(null);
      setIsAuthenticated(false);
      setLoading(false);
      setUser(null);
      
      // Check if the error is due to pending approval
      if (err.response?.status === 403 && err.response?.data?.approvalStatus) {
        setApprovalStatus(err.response.data.approvalStatus);
      }
      
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
    setLoading(false);
    setUser(null);
    setApprovalStatus(null);
    setPendingUsers([]);
  };

  // Load user
  const loadUser = useCallback(async () => {
    if (token) {
      setAuthToken(token);
      
      try {
        const res = await axios.get('/api/auth/user');
        setUser(res.data);
        setIsAuthenticated(true);
        setLoading(false);
      } catch (err) {
        localStorage.removeItem('token');
        setToken(null);
        setIsAuthenticated(false);
        setLoading(false);
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setLoading(false);
      setUser(null);
    }
  }, [token]);

  // Set auth token
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
    }
  };

  // Get pending users (admin only)
  const getPendingUsers = async () => {
    try {
      const res = await axios.get('/api/auth/pending-users');
      setPendingUsers(res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to get pending users:', err);
      return [];
    }
  };

  // Approve user (admin only)
  const approveUser = async (userId) => {
    try {
      const res = await axios.put(`/api/auth/approve-user/${userId}`);
      // Update pending users list
      setPendingUsers(pendingUsers.filter(user => user._id !== userId));
      return res.data;
    } catch (err) {
      console.error('Failed to approve user:', err);
      setError(err.response?.data?.message || 'Failed to approve user');
      return null;
    }
  };

  // Reject user (admin only)
  const rejectUser = async (userId) => {
    try {
      const res = await axios.put(`/api/auth/reject-user/${userId}`);
      // Update pending users list
      setPendingUsers(pendingUsers.filter(user => user._id !== userId));
      return res.data;
    } catch (err) {
      console.error('Failed to reject user:', err);
      setError(err.response?.data?.message || 'Failed to reject user');
      return null;
    }
  };

  // Clear errors
  const clearErrors = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated,
        loading,
        user,
        error,
        approvalStatus,
        pendingUsers,
        register,
        login,
        logout,
        loadUser,
        clearErrors,
        getPendingUsers,
        approveUser,
        rejectUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
