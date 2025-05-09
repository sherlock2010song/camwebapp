import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import './Camera.css';

// Function to detect iOS device
const isIOS = () => {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform) || 
  (navigator.userAgent.includes('Mac') && 'ontouchend' in document);
};

// Function to detect Android device
const isAndroid = () => {
  return /Android/i.test(navigator.userAgent);
};

// Function to check if device is mobile
const isMobile = () => {
  return isIOS() || isAndroid();
};

// Function to compress image before sending to OCR
const compressImage = (base64Image) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Image;
    
    img.onload = () => {
      // Create canvas with 1:1 aspect ratio
      const canvas = document.createElement('canvas');
      const MAX_SIZE = 1080; // Maximum dimension
      const size = Math.min(img.width, img.height, MAX_SIZE);
      
      canvas.width = size;
      canvas.height = size;
      
      // Draw image at center of square canvas
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, size, size);
      
      // Calculate scaling and positioning to center the image
      const scale = Math.min(size / img.width, size / img.height);
      const x = (size - img.width * scale) / 2;
      const y = (size - img.height * scale) / 2;
      
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      
      // Start with high quality
      let quality = 0.9;
      let result = canvas.toDataURL('image/jpeg', quality);
      
      // Reduce quality until file size is under 900KB
      while (result.length > 900 * 1024 && quality > 0.3) {
        quality -= 0.05;
        result = canvas.toDataURL('image/jpeg', quality);
      }
      
      resolve(result);
    };
  });
};

const Camera = () => {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [facingMode, setFacingMode] = useState(isMobile() ? 'environment' : 'user');
  const [cameraPermission, setCameraPermission] = useState(null);

  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        // Just check if we can enumerate devices, won't request permission yet
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some(device => device.kind === 'videoinput');
        console.log("Camera detected:", hasCamera);
        
        if (hasCamera) {
          // We detected a camera, but we don't initiate permission request automatically on iOS
          if (isIOS()) {
            console.log("iOS device detected - waiting for user interaction");
            setCameraPermission(null); // Set to null for iOS which requires interaction
          } else {
            // For non-iOS, try to get permission immediately
            try {
              await navigator.mediaDevices.getUserMedia({ video: true });
              setCameraPermission(true);
            } catch (err) {
              console.error("Camera permission denied:", err);
              setCameraPermission(false);
            }
          }
        } else {
          setCameraPermission(false);
        }
      } catch (err) {
        console.error("Error checking camera:", err);
        setCameraPermission(false);
      }
    };
    
    checkCameraPermission();
  }, []);

  const videoConstraints = {
    width: { ideal: 1920 },
    height: { ideal: 1920 },
    facingMode: facingMode,
    aspectRatio: { ideal: 1 }
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setOcrText('');
      setError('');
    }
  }, [webcamRef]);

  const switchCamera = () => {
    setFacingMode(prevMode => prevMode === 'user' ? 'environment' : 'user');
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
      // Compress image before sending to OCR
      const compressedImage = await compressImage(capturedImage);
      console.log(`Original size: ~${Math.round(capturedImage.length/1024)}KB, Compressed: ~${Math.round(compressedImage.length/1024)}KB`);
      
      const res = await axios.post('/api/ocr/process', {
        imageData: compressedImage
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

  // Special case for iOS and Android - show a button to initiate camera
  if (cameraPermission === null && (isIOS() || isAndroid())) {
    return (
      <div className="camera-permission-denied">
        <h2>Camera Access Required</h2>
        <p>{isIOS() ? 'Safari on iOS' : 'Your browser'} requires you to explicitly enable the camera. Please click the button below to start camera access.</p>
        <p><strong>Note:</strong> Some browsers may block camera access if you're not using HTTPS or if permissions weren't granted previously.</p>
        <button 
          className="btn btn-primary"
          onClick={async () => {
            try {
              // This explicit user action should trigger the permission prompt in Safari
              await navigator.mediaDevices.getUserMedia({ video: true });
              setCameraPermission(true);
            } catch (err) {
              console.error("Camera permission denied:", err);
              setCameraPermission(false);
            }
          }}
        >
          Enable Camera
        </button>
      </div>
    );
  }
  
  // Standard camera permission denied state
  if (cameraPermission === false) {
    return (
      <div className="camera-permission-denied">
        <h2>Camera Access Required</h2>
        <p>Please allow camera access to use this feature. You may need to update your browser settings.</p>
        <p>If using iOS Safari, make sure you're using HTTPS or add this site to allowed camera permissions in Safari settings.</p>
        <button 
          className="btn btn-primary"
          onClick={() => setCameraPermission(null)}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="camera-page">
      <h1 className="page-title">Camera OCR</h1>
      
      <div className="camera-container">
        {!capturedImage ? (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="camera-feed"
            />
            <div className="camera-controls">
              <button 
                className="camera-btn camera-btn-switch"
                onClick={switchCamera}
                aria-label="Switch Camera"
              >
                <span className="btn-icon">↺</span>
              </button>
              <button 
                className="camera-btn camera-btn-capture"
                onClick={capture}
                aria-label="Take Photo"
              >
                <div className="camera-btn-inner"></div>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="captured-image-container">
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="captured-image" 
              />
            </div>
            <div className="camera-controls">
              <button 
                className="btn btn-secondary"
                onClick={resetImage}
              >
                Retake
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

export default Camera;
