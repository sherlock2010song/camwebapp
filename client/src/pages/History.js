import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './History.css';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(null);
  const [expandedItem, setExpandedItem] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/ocr/history');
      // Sort by date (newest first)
      const sortedHistory = res.data.history.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setHistory(sortedHistory);
      setError('');
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const deleteHistoryItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await axios.delete(`/api/ocr/history/${id}`);
      setHistory(history.filter(item => item._id !== id));
    } catch (err) {
      console.error('Error deleting history item:', err);
      setError('Failed to delete item');
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(id);
        setTimeout(() => setCopied(null), 3000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        setError('Failed to copy text');
      });
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const toggleExpand = (id) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading history...</p>
      </div>
    );
  }

  return (
    <div className="history-page">
      <h1 className="page-title">OCR History</h1>
      
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}
      
      {history.length === 0 ? (
        <div className="empty-history">
          <p>No OCR history found. Use the camera to capture and process images.</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map(item => (
            <div key={item._id} className="history-item">
              <div className="history-item-header">
                <div className="history-item-date">
                  {formatDate(item.createdAt)}
                </div>
                <div className="history-item-actions">
                  <button 
                    className="btn-icon"
                    onClick={() => toggleExpand(item._id)}
                    aria-label={expandedItem === item._id ? "Collapse" : "Expand"}
                  >
                    {expandedItem === item._id ? '▲' : '▼'}
                  </button>
                  <button 
                    className="btn-icon"
                    onClick={() => deleteHistoryItem(item._id)}
                    aria-label="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className={`history-item-content ${expandedItem === item._id ? 'expanded' : ''}`}>
                <div className="history-item-image">
                  <img src={item.imageUrl} alt="OCR Capture" />
                </div>
                
                <div className="history-item-text">
                  <h3>Extracted Text</h3>
                  <div className="ocr-text">
                    {item.ocrText}
                  </div>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => copyToClipboard(item.ocrText, item._id)}
                  >
                    {copied === item._id ? 'Copied!' : 'Copy Text'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
