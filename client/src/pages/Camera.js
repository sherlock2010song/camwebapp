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

// Function to compress image and improve quality before sending to OCR
const compressImage = (base64Image) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Image;
    
    img.onload = () => {
      // Calculate optimal dimensions while preserving aspect ratio
      const MAX_SIZE = 1600; // Increased max dimension for better quality
      const aspectRatio = img.width / img.height;
      
      let width, height;
      if (img.width > img.height) {
        width = Math.min(img.width, MAX_SIZE);
        height = width / aspectRatio;
      } else {
        height = Math.min(img.height, MAX_SIZE);
        width = height * aspectRatio;
      }
      
      // Create canvas with calculated dimensions
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      // Apply sharpening and contrast enhancement
      const ctx = canvas.getContext('2d');
      
      // Draw the image first
      ctx.drawImage(img, 0, 0, width, height);
      
      // Apply contrast enhancement
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const contrast = 1.2; // Contrast factor (1.0 is normal)
      const brightness = 10; // Slight brightness increase
      
      for (let i = 0; i < data.length; i += 4) {
        // Apply contrast to RGB channels
        data[i] = Math.min(255, Math.max(0, (data[i] - 128) * contrast + 128 + brightness));
        data[i+1] = Math.min(255, Math.max(0, (data[i+1] - 128) * contrast + 128 + brightness));
        data[i+2] = Math.min(255, Math.max(0, (data[i+2] - 128) * contrast + 128 + brightness));
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      // Start with higher quality
      let quality = 0.95;
      let result = canvas.toDataURL('image/jpeg', quality);
      
      // Reduce quality until file size is under 980KB (just under 1MB)
      while (result.length > 980 * 1024 && quality > 0.5) {
        quality -= 0.05;
        result = canvas.toDataURL('image/jpeg', quality);
      }
      
      // Apply a smart quality optimization if still too large
      if (result.length > 980 * 1024) {
        // Create a smaller canvas for extreme cases
        const scaleFactor = Math.sqrt(980 * 1024 / result.length);
        const smallerCanvas = document.createElement('canvas');
        smallerCanvas.width = width * scaleFactor;
        smallerCanvas.height = height * scaleFactor;
        const smallerCtx = smallerCanvas.getContext('2d');
        smallerCtx.drawImage(canvas, 0, 0, smallerCanvas.width, smallerCanvas.height);
        result = smallerCanvas.toDataURL('image/jpeg', 0.85);
      }
      
      console.log(`Image optimized. Final size: ~${Math.round(result.length/1024)}KB`);
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
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' or 'upload'
  const fileInputRef = useRef(null);

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
    width: { min: 1280, ideal: 1920, max: 2560 },
    height: { min: 1280, ideal: 1920, max: 2560 },
    facingMode: facingMode,
    aspectRatio: { ideal: 1 },
    frameRate: { min: 15, ideal: 30 },
    focusMode: "continuous",
    exposureMode: "continuous",
    whiteBalanceMode: "continuous"
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
      
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'camera' ? 'active' : ''}`}
          onClick={() => setActiveTab('camera')}
        >
          Camera
        </button>
        <button 
          className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          Upload Image
        </button>
      </div>
      
      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
      
      <div className="camera-container">
        {!capturedImage ? (
          <>
            {activeTab === 'camera' ? (
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
              <div className="upload-container">
                <div className="upload-box" onClick={triggerFileInput}>
                  <div className="upload-icon">+</div>
                  <p>Click to select an image from your photo library</p>
                </div>
              </div>
            )}
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
