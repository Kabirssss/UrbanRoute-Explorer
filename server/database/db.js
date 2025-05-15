const mongoose = require('mongoose');
const config = require('../config');

const db = {
  connect: async () => {
    try {
      // Use MongoDB URI from config or fall back to local development URI
      const uri = config.MONGODB_URI || 'mongodb://localhost:27017/path-visualizer';
      
      console.log('Attempting to connect to MongoDB at:', uri);
      
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      });
      
      console.log('Connected to MongoDB database');
      return true;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      console.log('Falling back to in-memory storage mode...');
      
      // Log helpful troubleshooting tips
      if (error.name === 'MongoNetworkError') {
        console.log('\nTROUBLESHOOTING TIPS:');
        console.log('1. Ensure MongoDB is installed and running');
        console.log('2. Check MongoDB service status: sudo systemctl status mongodb');
        console.log('3. Try starting MongoDB: sudo systemctl start mongodb');
        console.log('4. If using cloud MongoDB, check your IP whitelist and credentials');
      }
      
      throw error;
    }
  },
  
  disconnect: async () => {
    try {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }
};

module.exports = db;
