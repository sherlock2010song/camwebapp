import React, { useState, useRef } from 'react';
import axios from 'axios';
import './Upload.css';

const Upload = () => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    
    if (file) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        setCapturedImage(e.target.result);
        setOcrText('');
        setError('');
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const resetImage = () => {
    setCapturedImage(null);
    setOcrText('');
    setError('');
    setCopied(false);
  };

  const processImage = async () => {
    if (!capturedImage) return;

    setIsProcessing(true);
    setOcrText('');
    setError('');

    try {
      // Use original image without compression for better quality
      console.log(`Using original image size: ~${Math.round(capturedImage.length/1024)}KB`);
      
      const res = await axios.post('/api/ocr/process', {
        imageData: capturedImage
      });

      setOcrText(res.data.ocrText);
    } catch (err) {
      console.error('OCR processing error:', err);
      setError(err.response?.data?.message || 'Error processing image');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(ocrText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        setError('Failed to copy text');
      });
  };

  return (
    <div className="upload-page">
      <h1 className="page-title">Upload Image for OCR</h1>
      
      <div className="upload-container-main">
        {!capturedImage ? (
          <>
            <div className="upload-area" onClick={triggerFileInput}>
              <div className="upload-icon">+</div>
              <p>Click to select an image from your photo library</p>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </div>
          </>
        ) : (
          <>
            <div className="captured-image-container">
              <img 
                src={capturedImage} 
                alt="Uploaded" 
                className="captured-image" 
              />
            </div>
            <div className="upload-controls">
              <button 
                className="btn btn-secondary"
                onClick={resetImage}
              >
                Select Different Image
              </button>
              <button 
                className="btn btn-primary"
                onClick={processImage}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Extract Text'}
              </button>
            </div>
          </>
        )}
      </div>
      
      {error && (
        <div className="alert alert-danger mt-3">
          {error}
        </div>
      )}
      
      {isProcessing && (
        <div className="processing-indicator">
          <div className="loading-spinner"></div>
          <p>Processing image...</p>
        </div>
      )}
      
      {ocrText && (
        <div className="ocr-result">
          <h2>Extracted Text</h2>
          <div className="ocr-text arial-font">
            {ocrText}
          </div>
          <div className="ocr-actions">
            <button 
              className="btn btn-primary"
              onClick={copyToClipboard}
            >
              {copied ? 'Copied!' : 'Copy Text'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
