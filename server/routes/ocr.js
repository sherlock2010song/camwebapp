const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   POST api/ocr/process
// @desc    Process image with OCR
// @access  Private
router.post('/process', auth, async (req, res) => {
  try {
    const { imageData } = req.body;
    
    if (!imageData) {
      return res.status(400).json({ message: 'No image data provided' });
    }

    // Call OpenRouter API to process the image
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: "google/gemini-2.0-flash-exp:free",
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Please extract all text from this image using OCR. Return only the extracted text without any explanations or formatting.' },
              { type: 'image_url', image_url: { url: imageData } }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://camera-ocr-app.com'
        }
      }
    );

    // Extract the OCR result from the response
    const ocrText = response.data.choices[0].message.content;

    // Save OCR result to user's history
    const user = await User.findById(req.user.id);
    user.ocrHistory.push({
      imageUrl: imageData,
      ocrText,
      createdAt: Date.now()
    });
    await user.save();

    res.json({ ocrText });
  } catch (err) {
    console.error('OCR processing error:', err);
    res.status(500).json({ 
      message: 'Error processing image', 
      error: err.message || 'Unknown error'
    });
  }
});

// @route   GET api/ocr/history
// @desc    Get user's OCR history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ history: user.ocrHistory });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/ocr/history/:id
// @desc    Delete OCR history item
// @access  Private
router.delete('/history/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Find and remove the history item
    const historyIndex = user.ocrHistory.findIndex(item => item._id.toString() === req.params.id);
    
    if (historyIndex === -1) {
      return res.status(404).json({ message: 'History item not found' });
    }
    
    user.ocrHistory.splice(historyIndex, 1);
    await user.save();
    
    res.json({ message: 'History item removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
