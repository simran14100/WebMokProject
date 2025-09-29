require('dotenv').config();
const mongoose = require('mongoose');
const cleanupOrphanedTimetableEntries = require('../edTechServer/utils/cleanupOrphanedTimetableEntries');
const connectDB = require('../edTechServer/config/db');

(async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Connected to database');
    
    console.log('Starting cleanup of orphaned timetable entries...');
    const result = await cleanupOrphanedTimetableEntries();
    
    console.log(`\nCleanup complete. Deleted ${result.deletedCount} orphaned timetable entries.`);
    process.exit(0);
  } catch (error) {
    console.error('\nCleanup failed:', error);
    process.exit(1);
  }
})();
