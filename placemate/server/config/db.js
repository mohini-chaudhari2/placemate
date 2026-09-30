const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('MongoDB connecting...');
    const uri = process.env.MONGODB_URI ? process.env.MONGODB_URI.trim().replace(/^["']|["']$/g, '') : '';
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
