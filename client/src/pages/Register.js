import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [showError, setShowError] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  const { register, error, clearErrors } = useContext(AuthContext);
  
  const { username, password, confirmPassword } = formData;
  
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
    
    if (e.target.name === 'confirmPassword' || (e.target.name === 'password' && confirmPassword)) {
      if (e.target.name === 'password' && confirmPassword !== e.target.value) {
        setPasswordError('Passwords do not match');
      } else if (e.target.name === 'confirmPassword' && password !== e.target.value) {
        setPasswordError('Passwords do not match');
      } else {
        setPasswordError('');
      }
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    register(username, password);
  };
  
  return (
    <div className="form-container">
      <h1 className="form-title">Register</h1>
      
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
            minLength="3"
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
            minLength="6"
            autoComplete="new-password"
          />
          <small>Password must be at least 6 characters</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className="form-control"
            value={confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
          {passwordError && <small style={{ color: 'red' }}>{passwordError}</small>}
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary btn-block"
          disabled={passwordError !== ''}
        >
          Register
        </button>
      </form>
      
      <p className="form-link">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;
