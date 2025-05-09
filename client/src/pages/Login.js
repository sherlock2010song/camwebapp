import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showError, setShowError] = useState(false);
  
  const { login, error, clearErrors, isAuthenticated } = useContext(AuthContext);
  
  const { username, password } = formData;
  
  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        clearErrors();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, clearErrors]);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    login(username, password);
  };
  
  return (
    <div className="form-container">
      <h1 className="form-title">Login</h1>
      
      {showError && (
        <div className="alert alert-danger">{error}</div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            className="form-control"
            value={username}
            onChange={handleChange}
            required
            autoComplete="username"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            className="form-control"
            value={password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />
        </div>
        
        <button type="submit" className="btn btn-primary btn-block">
          Login
        </button>
      </form>
      
      <p className="form-link">
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;
