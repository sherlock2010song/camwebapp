import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Welcome, {user?.username}</h1>
      
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <div className="card-icon">
            <i className="fas fa-camera"></i>
          </div>
          <h2>Take a Photo</h2>
          <p>Use your device's camera to capture an image and extract text using OCR.</p>
          <Link to="/camera" className="btn btn-primary">
            Open Camera
          </Link>
        </div>
        
        <div className="dashboard-card">
          <div className="card-icon">
            <i className="fas fa-history"></i>
          </div>
          <h2>View History</h2>
          <p>Access your previous OCR results and manage your captured images.</p>
          <Link to="/history" className="btn btn-primary">
            View History
          </Link>
        </div>
        
        {user?.isAdmin && (
          <div className="dashboard-card">
            <div className="card-icon">
              <i className="fas fa-users-cog"></i>
            </div>
            <h2>Admin Panel</h2>
            <p>Manage users and view system statistics.</p>
            <Link to="/admin" className="btn btn-primary">
              Admin Panel
            </Link>
          </div>
        )}
      </div>
      
      <div className="dashboard-instructions">
        <h2>How to use:</h2>
        <ol>
          <li>Go to the <strong>Camera</strong> page.</li>
          <li>Allow camera access when prompted.</li>
          <li>Take a photo of the text you want to extract.</li>
          <li>The OCR will process the image and extract the text.</li>
          <li>Copy the text or save it for later.</li>
        </ol>
        <p className="note">
          <strong>Note:</strong> For best results, ensure good lighting and that the text is clear in the frame.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
