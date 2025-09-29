const mongoose = require('mongoose');
const Timetable = require('../models/Timetable');

// Simple logger
const logger = {
  info: (message, ...args) => console.log(`[INFO] ${message}`, ...args),
  error: (message, ...args) => console.error(`[ERROR] ${message}`, ...args)
};

/**
 * Clean up orphaned timetable entries (entries where subject doesn't exist)
 * @returns {Promise<{deletedCount: number}>} Number of deleted entries
 */
const cleanupOrphanedTimetableEntries = async () => {
  try {
    logger.info('Starting cleanup of orphaned timetable entries...');
    
    // Get all distinct subject IDs from the subjects collection
    const Subject = mongoose.model('UGPGSubject');
    const subjects = await Subject.find({}, '_id');
    const validSubjectIds = subjects.map(s => s._id);
    
    logger.info(`Found ${validSubjectIds.length} valid subjects in the database`);
    
    // Find and count orphaned entries without deleting them yet
    const orphanedEntries = await Timetable.find({
      subject: { $nin: validSubjectIds }
    }).select('_id subject').lean();
    
    logger.info(`Found ${orphanedEntries.length} orphaned timetable entries to clean up`);
    
    if (orphanedEntries.length > 0) {
      // Log some sample orphaned entries for debugging
      logger.info('Sample of orphaned entries to be deleted:', 
        orphanedEntries.slice(0, 5).map(e => ({
          _id: e._id,
          subject: e.subject
        }))
      );
      
      // Delete all orphaned entries
      const result = await Timetable.deleteMany({
        _id: { $in: orphanedEntries.map(e => e._id) }
      });
      
      logger.info(`Successfully deleted ${result.deletedCount} orphaned timetable entries`);
      return { deletedCount: result.deletedCount };
    }
    
    logger.info('No orphaned timetable entries found');
    return { deletedCount: 0 };
    
  } catch (error) {
    logger.error('Error cleaning up orphaned timetable entries:', error);
    throw error;
  }
};

// Export the function
module.exports = cleanupOrphanedTimetableEntries;

// If this file is run directly (not required), execute the cleanup
if (require.main === module) {
  require('dotenv').config();
  const connectDB = require('../config/db');
  
  (async () => {
    try {
      await connectDB();
      console.log('Connected to database');
      
      const result = await cleanupOrphanedTimetableEntries();
      console.log(`Cleanup complete. Deleted ${result.deletedCount} entries.`);
      
      process.exit(0);
    } catch (error) {
      console.error('Cleanup failed:', error);
      process.exit(1);
    }
  })();
}
