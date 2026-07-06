const express = require('express');
const {
  getUsers,
  deleteUser,
  getSubscriptions,
  updateSubscriptionStatus,
  getAnalytics,
  updateSettings,
  grantAccess,
  getDataDump
} = require('../controllers/adminController');
const { addMember } = require('../controllers/authController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { mongoIdParam, handleValidation } = require('../utils/validation');

const router = express.Router();

router.get('/users', verifyToken, isAdmin, getUsers);
router.delete('/users/:id', verifyToken, isAdmin, mongoIdParam, handleValidation, deleteUser);
router.get('/subscriptions', verifyToken, isAdmin, getSubscriptions);
router.patch('/subscriptions/:id', verifyToken, isAdmin, mongoIdParam, handleValidation, updateSubscriptionStatus);
router.get('/analytics', verifyToken, isAdmin, getAnalytics);
router.post('/settings', verifyToken, isAdmin, updateSettings);
router.post('/add-member', verifyToken, isAdmin, addMember);
router.put('/users/:id/grant', verifyToken, isAdmin, mongoIdParam, handleValidation, grantAccess);
router.get('/data-dump', verifyToken, isAdmin, getDataDump);

module.exports = router;
