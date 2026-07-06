const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/env');
const tokenUtils = require('../utils/token');

const verifyToken = async (req, res, next) => {
  try {
    const token = tokenUtils.getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Session expired. Please login again.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

const checkSubscription = (req, res, next) => {
  if (req.user.isSubscribed || req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Subscription required to access this content.' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required.' });
  }
};

const isStudent = (req, res, next) => {
  if (req.user.role === 'student') {
    next();
  } else {
    res.status(403).json({ message: 'Student access required.' });
  }
};

module.exports = {
  verifyToken,
  checkSubscription,
  isAdmin,
  isStudent,
  ...tokenUtils
};
