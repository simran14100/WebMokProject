const cron = require('node-cron');
const cleanupOrphanedTimetableEntries = require('./cleanupOrphanedTimetableEntries');

// Simple logger replacement since we're not using winston
const logger = {
  info: (message, ...args) => console.log(`[INFO] ${message}`, ...args),
  error: (message, ...args) => console.error(`[ERROR] ${message}`, ...args)
};

// Schedule cleanup to run every day at 2 AM
const scheduleCleanup = () => {
  cron.schedule('0 2 * * *', async () => {
    try {
      logger.info('Starting scheduled cleanup of orphaned timetable entries...');
      const result = await cleanupOrphanedTimetableEntries();
      logger.info(`Scheduled cleanup complete. Deleted ${result.deletedCount} orphaned entries.`);
    } catch (error) {
      logger.error('Scheduled cleanup failed:', error);
    }
  }, {
    timezone: 'Asia/Kolkata' // Adjust to your timezone
  });
};

module.exports = scheduleCleanup;
