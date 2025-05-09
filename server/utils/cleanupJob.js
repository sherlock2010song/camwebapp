const cron = require('node-cron');
const User = require('../models/User');

// Function to remove OCR history entries older than 24 hours
const cleanupOldHistories = async () => {
  try {
    console.log('Running scheduled cleanup of old OCR history entries...');
    
    // Calculate the timestamp from 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    // Find all users
    const users = await User.find({});
    let totalRemoved = 0;
    
    // For each user, filter out old history entries
    for (const user of users) {
      const originalHistoryLength = user.ocrHistory.length;
      
      // Filter out entries older than 24 hours
      user.ocrHistory = user.ocrHistory.filter(entry => {
        return new Date(entry.createdAt) >= twentyFourHoursAgo;
      });
      
      // If any entries were removed, save the user
      if (user.ocrHistory.length < originalHistoryLength) {
        const removedCount = originalHistoryLength - user.ocrHistory.length;
        totalRemoved += removedCount;
        await user.save();
        console.log(`Removed ${removedCount} old history entries for user ${user.username}`);
      }
    }
    
    console.log(`Cleanup complete. Total entries removed: ${totalRemoved}`);
  } catch (error) {
    console.error('Error during OCR history cleanup:', error);
  }
};

// Schedule the cleanup job to run once per hour
// This will check and remove entries that have become older than 24 hours
const scheduleCleanupJob = () => {
  // Run every hour at minute 0 (e.g., 1:00, 2:00, etc.)
  cron.schedule('0 * * * *', cleanupOldHistories);
  console.log('Scheduled OCR history cleanup job (runs hourly)');
  
  // Also run immediately on server start to clean up any existing old entries
  cleanupOldHistories();
};

module.exports = {
  scheduleCleanupJob
};
