const express = require('express');
const Route = require('../models/Route');
const User = require('../models/User');
const { protect, checkOwnership } = require('../middleware/authMiddleware');
const router = express.Router();

// Get all routes - public and personal
router.get('/routes', async (req, res) => {
  try {
    const { userId, isPublic, city, algorithm } = req.query;
    
    // Build filter object
    const filter = {};
    
    // Filter by user if provided
    if (userId) filter.userId = userId;
    
    // Filter by public status if provided
    if (isPublic !== undefined) filter.isPublic = isPublic === 'true';
    
    // Filter by city if provided
    if (city) filter.city = city;
    
    // Filter by algorithm if provided
    if (algorithm) filter.algorithm = algorithm;
    
    // If user is authenticated, also include routes shared with them
    let sharedRoutes = [];
    if (req.user) {
      sharedRoutes = await Route.find({
        'sharedWith.userId': req.user._id
      }).sort({ createdAt: -1 });
    }
    
    // Get public or personal routes
    const routes = await Route.find(filter)
      .sort({ createdAt: -1 })
      .limit(100); // Limit to prevent large responses
    
    // Combine and deduplicate routes
    const allRoutes = [...routes];
    
    // Add shared routes if authenticated and userId filter not used
    if (req.user && !userId) {
      // Filter out duplicates
      sharedRoutes.forEach(shared => {
        if (!allRoutes.some(r => r._id.toString() === shared._id.toString())) {
          allRoutes.push(shared);
        }
      });
    }
    
    res.json({ routes: allRoutes });
  } catch (err) {
    console.error('Error fetching routes:', err);
    res.status(500).json({ error: 'Failed to fetch routes', details: err.message });
  }
});

// Protected routes - only for authenticated users
// Get my routes
router.get('/my-routes', protect, async (req, res) => {
  try {
    const routes = await Route.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
      
    res.json({ routes });
  } catch (err) {
    console.error('Error fetching user routes:', err);
    res.status(500).json({ error: 'Failed to fetch routes', details: err.message });
  }
});

// Get shared with me routes
router.get('/shared-with-me', protect, async (req, res) => {
  try {
    const routes = await Route.find({
      'sharedWith.userId': req.user._id
    }).sort({ createdAt: -1 });
      
    res.json({ routes });
  } catch (err) {
    console.error('Error fetching shared routes:', err);
    res.status(500).json({ error: 'Failed to fetch shared routes', details: err.message });
  }
});

// Get a specific route
router.get('/routes/:id', async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    // Check if the route is public, owned by user, or shared with user
    const isOwner = req.user && route.userId && route.userId.toString() === req.user._id.toString();
    const isSharedWithUser = req.user && route.sharedWith.some(
      share => share.userId.toString() === req.user._id.toString()
    );
    
    if (!route.isPublic && !isOwner && !isSharedWithUser) {
      return res.status(403).json({ error: 'You do not have permission to view this route' });
    }
    
    res.json(route);
  } catch (err) {
    console.error('Error fetching route:', err);
    res.status(500).json({ error: 'Failed to fetch route', details: err.message });
  }
});

// Create a new route - protected
router.post('/routes', protect, async (req, res) => {
  const { 
    name, description, startPoint, endPoint, 
    waypoints, algorithm, city, path, distance, duration, isPublic, tags
  } = req.body;
  
  if (!name || !startPoint || !endPoint || !algorithm || !city) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    const route = new Route({
      name,
      description,
      startPoint,
      endPoint,
      waypoints: waypoints || [],
      algorithm,
      city,
      path: path || [],
      distance,
      duration,
      userId: req.user._id,
      isPublic: isPublic || false,
      tags: tags || []
    });
    
    await route.save();
    res.status(201).json(route);
  } catch (err) {
    console.error('Error creating route:', err);
    res.status(500).json({ error: 'Failed to create route', details: err.message });
  }
});

// Update a route - protected & ownership check
router.put('/routes/:id', protect, checkOwnership(Route), async (req, res) => {
  const { 
    name, description, waypoints, isPublic, tags 
  } = req.body;
  
  try {
    const route = await Route.findById(req.params.id);
    
    // Update allowed fields
    if (name) route.name = name;
    if (description !== undefined) route.description = description;
    if (waypoints) route.waypoints = waypoints;
    if (isPublic !== undefined) route.isPublic = isPublic;
    if (tags) route.tags = tags;
    
    await route.save();
    res.json(route);
  } catch (err) {
    console.error('Error updating route:', err);
    res.status(500).json({ error: 'Failed to update route', details: err.message });
  }
});

// Delete a route - protected & ownership check
router.delete('/routes/:id', protect, checkOwnership(Route), async (req, res) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    res.json({ message: 'Route deleted successfully' });
  } catch (err) {
    console.error('Error deleting route:', err);
    res.status(500).json({ error: 'Failed to delete route', details: err.message });
  }
});

// Share a route with another user
router.post('/routes/:id/share', protect, checkOwnership(Route), async (req, res) => {
  const { username, accessLevel } = req.body;
  
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  
  try {
    const route = await Route.findById(req.params.id);
    const userToShare = await User.findOne({ username });
    
    if (!userToShare) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if route is already shared with this user
    const alreadyShared = route.sharedWith.some(
      share => share.userId.toString() === userToShare._id.toString()
    );
    
    if (alreadyShared) {
      // Update the access level if already shared
      route.sharedWith = route.sharedWith.map(share => {
        if (share.userId.toString() === userToShare._id.toString()) {
          share.accessLevel = accessLevel || 'read';
          share.sharedAt = Date.now();
        }
        return share;
      });
    } else {
      // Add new sharing entry
      route.sharedWith.push({
        userId: userToShare._id,
        accessLevel: accessLevel || 'read'
      });
    }
    
    await route.save();
    
    res.json({
      message: `Route successfully shared with ${username}`,
      sharedWith: route.sharedWith
    });
  } catch (err) {
    console.error('Error sharing route:', err);
    res.status(500).json({ error: 'Failed to share route', details: err.message });
  }
});

// Remove share access
router.delete('/routes/:id/share/:userId', protect, checkOwnership(Route), async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    
    // Filter out the user from sharedWith array
    route.sharedWith = route.sharedWith.filter(
      share => share.userId.toString() !== req.params.userId
    );
    
    await route.save();
    
    res.json({
      message: 'Sharing permission revoked',
      sharedWith: route.sharedWith
    });
  } catch (err) {
    console.error('Error removing share access:', err);
    res.status(500).json({ error: 'Failed to remove sharing access', details: err.message });
  }
});

module.exports = router;
