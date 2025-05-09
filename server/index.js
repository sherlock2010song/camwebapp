require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { scheduleCleanupJob } = require('./utils/cleanupJob');

// Import routes
const authRoutes = require('./routes/auth');
const ocrRoutes = require('./routes/ocr');
const userRoutes = require('./routes/users');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/users', userRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
  });
}

// Create admin user on startup
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const createAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    if (!adminExists) {
      // Create new admin user if it doesn't exist
      await User.create({
        username: 'admin',
        password: hashedPassword,
        isAdmin: true
      });
      
      console.log('Admin user created successfully');
    } else {
      // Update existing admin user password
      adminExists.password = hashedPassword;
      await adminExists.save();
      console.log('Admin password reset successfully');
    }
  } catch (error) {
    console.error('Error creating/updating admin user:', error);
  }
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  createAdminUser();
  
  // Initialize cleanup job to remove OCR history entries older than 24 hours
  scheduleCleanupJob();
});
