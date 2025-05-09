const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post(
  '/register',
  [
    check('username', 'Username is required').not().isEmpty(),
    check('username', 'Username must be at least 3 characters').isLength({ min: 3 }),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      // Check if user exists
      let user = await User.findOne({ username });

      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create new user with pending approval status
      user = new User({
        username,
        password,
        approved: false,
        approvalStatus: 'pending'
      });

      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // Save user to database
      await user.save();

      // Return jsonwebtoken
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '7d' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('username', 'Username is required').exists(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      // Check if user exists
      const user = await User.findOne({ username });

      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Check if user is approved (skip for admin)
      if (!user.isAdmin && user.approvalStatus !== 'approved') {
        return res.status(403).json({ 
          message: 'Your account is pending approval',
          approvalStatus: user.approvalStatus
        });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Return jsonwebtoken
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '7d' },
        (err, token) => {
          if (err) throw err;
          res.json({ 
            token,
            user: {
              id: user.id,
              username: user.username,
              isAdmin: user.isAdmin,
              approved: user.approved,
              approvalStatus: user.approvalStatus
            }
          });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/pending-users
// @desc    Get all users with pending approval (admin only)
// @access  Private/Admin
router.get('/pending-users', auth, async (req, res) => {
  try {
    // Check if user is admin
    const admin = await User.findById(req.user.id);
    if (!admin.isAdmin) {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

    // Get all pending users
    const pendingUsers = await User.find({ approvalStatus: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(pendingUsers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/auth/approve-user/:userId
// @desc    Approve a user (admin only)
// @access  Private/Admin
router.put('/approve-user/:userId', auth, async (req, res) => {
  try {
    // Check if user is admin
    const admin = await User.findById(req.user.id);
    if (!admin.isAdmin) {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

    // Find and update user
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.approved = true;
    user.approvalStatus = 'approved';
    await user.save();

    res.json({ message: 'User approved successfully', user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/auth/reject-user/:userId
// @desc    Reject a user (admin only)
// @access  Private/Admin
router.put('/reject-user/:userId', auth, async (req, res) => {
  try {
    // Check if user is admin
    const admin = await User.findById(req.user.id);
    if (!admin.isAdmin) {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

    // Find and update user
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.approved = false;
    user.approvalStatus = 'rejected';
    await user.save();

    res.json({ message: 'User rejected successfully', user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
