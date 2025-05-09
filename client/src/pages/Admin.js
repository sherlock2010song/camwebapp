import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/users');
      setUsers(res.data);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Make sure you have admin privileges.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (userId) => {
    setDeleteConfirm(userId);
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(`/api/users/${userId}`);
      setUsers(users.filter(user => user._id !== userId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h1 className="page-title">Admin Panel</h1>
      
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}
      
      <div className="admin-card">
        <div className="admin-card-header">
          <h2>User Management</h2>
          <button 
            className="btn btn-primary btn-sm"
            onClick={fetchUsers}
          >
            Refresh
          </button>
        </div>
        
        {users.length === 0 ? (
          <p className="empty-message">No users found.</p>
        ) : (
          <div className="user-table-container">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>OCR Count</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.username}</td>
                    <td>{user.isAdmin ? 'Admin' : 'User'}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>{user.ocrHistory?.length || 0}</td>
                    <td>
                      {!user.isAdmin && (
                        <>
                          {deleteConfirm === user._id ? (
                            <div className="confirm-buttons">
                              <button 
                                className="btn btn-danger btn-sm"
                                onClick={() => deleteUser(user._id)}
                              >
                                Confirm
                              </button>
                              <button 
                                className="btn btn-secondary btn-sm"
                                onClick={cancelDelete}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => confirmDelete(user._id)}
                            >
                              Delete
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="admin-card stats-card">
        <h2>System Statistics</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{users.length}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {users.reduce((total, user) => total + (user.ocrHistory?.length || 0), 0)}
            </div>
            <div className="stat-label">Total OCR Processes</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {users.filter(user => !user.isAdmin).length}
            </div>
            <div className="stat-label">Regular Users</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {users.filter(user => user.isAdmin).length}
            </div>
            <div className="stat-label">Admins</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
