require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/path-visualizer',
  JWT_SECRET: process.env.JWT_SECRET || 'your-dev-jwt-secret',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  COOKIE_EXPIRE: parseInt(process.env.COOKIE_EXPIRE) || 30,
  FILE_STORAGE_PATH: process.env.FILE_STORAGE_PATH || './data',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000'
};
