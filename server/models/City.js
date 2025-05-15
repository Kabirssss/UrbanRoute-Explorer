const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  centerCoords: {
    lat: Number,
    lng: Number
  },
  description: String,
  hasRealData: {
    type: Boolean,
    default: false
  },
  dataPath: String,
  addedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('City', citySchema);
