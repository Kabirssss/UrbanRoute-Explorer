const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  startPoint: {
    lat: Number,
    lng: Number,
    name: String
  },
  endPoint: {
    lat: Number,
    lng: Number,
    name: String
  },
  waypoints: [{
    lat: Number,
    lng: Number,
    name: String
  }],
  algorithm: {
    type: String,
    enum: ['dijkstra', 'astar', 'bfs', 'dfs'],
    required: true
  },
  city: {
    type: String,
    required: true
  },
  path: [{
    lat: Number,
    lng: Number,
    nodeId: String
  }],
  distance: Number,
  duration: Number,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    accessLevel: {
      type: String,
      enum: ['read', 'edit'],
      default: 'read'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likes: {
    type: Number,
    default: 0
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
routeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Route', routeSchema);
