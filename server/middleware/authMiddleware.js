const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check if auth header exists and starts with Bearer
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Extract token from Bearer string
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    // Alternative: check for token in cookies
    token = req.cookies.token;
  }

  // If no token, return unauthorized
  if (!token) {
    return res.status(401).json({ error: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Find user by ID from token
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(401).json({ error: 'Not authorized to access this route' });
  }
};

// Check if user is owner of a resource
exports.checkOwnership = (Model) => async (req, res, next) => {
  try {
    const resource = await Model.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Check if the logged-in user owns this resource
    if (resource.userId && resource.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to access this resource' });
    }
    
    next();
  } catch (err) {
    console.error('Ownership check error:', err);
    res.status(500).json({ error: 'Error checking resource ownership' });
  }
};
