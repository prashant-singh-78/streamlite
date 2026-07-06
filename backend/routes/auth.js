const express = require('express');
const {
  register,
  login,
  logout,
  getProfile,
  updateProfile
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const {
  registerRules,
  loginRules,
  profileUpdateRules,
  handleValidation
} = require('../utils/validation');

const router = express.Router();

router.post('/register', registerRules, handleValidation, register);
router.post('/signup', registerRules, handleValidation, register);
router.post('/login', loginRules, handleValidation, login);
router.post('/logout', logout);
router.get('/me', verifyToken, getProfile);
router.put('/profile', verifyToken, profileUpdateRules, handleValidation, updateProfile);

module.exports = router;
