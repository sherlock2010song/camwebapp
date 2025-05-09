import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [showError, setShowError] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [registrationSubmitted, setRegistrationSubmitted] = useState(false);
  const navigate = useNavigate();
  
  const { register, error, approvalStatus, clearErrors } = useContext(AuthContext);
  
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    await register(username, password);
    setRegistrationSubmitted(true);
  };
  
  // If registration was submitted successfully, show pending approval message
  if (registrationSubmitted && !error) {
    return (
      <div className="form-container">
        <div className="registration-success">
          <h1 className="form-title">Registration Submitted</h1>
          <div className="alert alert-info">
            <p>Thank you for registering! Your account is pending administrator approval.</p>
            <p>You will be able to log in once your account has been approved.</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h1 className="form-title">Register</h1>
      
      {showError && (
        <div className="alert alert-danger">{error}</div>
      )}
      
      <div className="alert alert-warning">
        <p><strong>Note:</strong> New accounts require administrator approval before they can be used.</p>
      </div>
      
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
