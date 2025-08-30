const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URL = process.env.MONGODB_URL;

console.log('Attempting to connect to MongoDB with URL:', MONGODB_URL);

mongoose.connect(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
.then(() => {
    console.log('Successfully connected to MongoDB');
    process.exit(0);
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});
