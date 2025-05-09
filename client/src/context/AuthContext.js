import React, { createContext, useState, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    } catch (err) {
      localStorage.removeItem('token');
      setToken(null);
      setIsAuthenticated(false);
      setLoading(false);
      setUser(null);
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
        register,
        login,
        logout,
        loadUser,
        clearErrors
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
