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
            <i className="fas fa-upload"></i>
          </div>
          <h2>Upload Image</h2>
          <p>Upload an image from your device and extract text using OCR.</p>
          <Link to="/upload" className="btn btn-primary">
            Upload Image
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
          <li>Choose one of the options:</li>
          <ul>
            <li><strong>Take a Photo</strong>: Use your device's camera to capture an image.</li>
            <li><strong>Upload Image</strong>: Select an image from your photo library or local files.</li>
          </ul>
          <li>Process the image using the "Extract Text" button.</li>
          <li>The OCR will extract the text from your image.</li>
          <li>Copy the extracted text or view it in your history later.</li>
        </ol>
        <p className="note">
          <strong>Note:</strong> For best results, ensure good lighting and that the text is clear in the image.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
