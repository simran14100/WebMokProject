const mongoose = require("mongoose");
require("dotenv").config();

const { MONGODB_URL, NODE_ENV } = process.env;

// Import the schedule cleanup function
const scheduleCleanup = require('../utils/scheduleCleanup');

exports.connect = () => {
  // Prefer explicit options; helps with certain Atlas clusters and TLS
  const options = {
    // serverSelectionTimeoutMS: 15000, // wait up to 15s for primary
    // directConnection: false,        // keep default; set true if using mongodb://<host>:27017
  };

  return mongoose
    .connect(MONGODB_URL, options)
    .then(() => {
      console.log(`DB Connection Success`);
      
      // Start the scheduled cleanup in production or when explicitly enabled
      if (NODE_ENV === 'production' || process.env.ENABLE_SCHEDULED_CLEANUP === 'true') {
        console.log('Starting scheduled cleanup of orphaned timetable entries...');
        scheduleCleanup();
      }
    })
    .catch((err) => {
      console.log(`DB Connection Failed`);
      console.log(err);
      // Avoid killing the dev server so we can inspect errors and retry
      if (NODE_ENV === "production") {
        process.exit(1);
      }
      // Re-throw so callers can handle failures if needed
      throw err;
    });
};
