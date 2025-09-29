require('dotenv').config();
const mongoose = require('mongoose');
const cleanupOrphanedTimetableEntries = require('../edTechServer/utils/cleanupOrphanedTimetableEntries');
const connectDB = require('../edTechServer/config/database');

(async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Connected to database');
    
    console.log('\n=== Starting Test Cleanup ===');
    const result = await cleanupOrphanedTimetableEntries();
    
    console.log('\n=== Test Cleanup Results ===');
    console.log(`Deleted ${result.deletedCount} orphaned timetable entries`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n=== Test Cleanup Failed ===');
    console.error(error);
    process.exit(1);
  }
})();
