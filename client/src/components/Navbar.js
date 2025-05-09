import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/dashboard" className="navbar-logo">
          Camera OCR
        </Link>
        <div className="navbar-menu">
          <Link to="/dashboard" className="navbar-item">
            Dashboard
          </Link>
          <Link to="/camera" className="navbar-item">
            Camera
          </Link>
          <Link to="/history" className="navbar-item">
            History
          </Link>
          {user && user.isAdmin && (
            <Link to="/admin" className="navbar-item">
              Admin
            </Link>
          )}
          <button onClick={handleLogout} className="navbar-item logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
