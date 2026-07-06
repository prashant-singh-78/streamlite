const User = require('../models/User');
const { signToken, setAuthCookie, clearAuthCookie } = require('../middleware/auth');
const { normalizeRole } = require('../utils/helpers');

const register = async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber, role } = req.body;

    if (role === 'admin') {
      return res.status(403).json({ message: 'Admin accounts cannot be created via registration.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      phoneNumber: phoneNumber || '',
      role: 'student'
    });

    const token = signToken(user._id, user.role);
    setAuthCookie(res, token);

    res.status(201).json({
      message: 'Registration successful.',
      token,
      user: user.toSafeObject()
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken(user._id, user.role);
    setAuthCookie(res, token);

    res.json({
      message: 'Login successful.',
      token,
      user: user.toSafeObject()
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed.', error: error.message });
  }
};

const logout = (req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'Logged out successfully.' });
};

const getProfile = (req, res) => {
  res.json({ user: req.user.toSafeObject() });
};

const updateProfile = async (req, res) => {
  try {
    const { fullName, phoneNumber, password } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (fullName) user.fullName = fullName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (password) user.password = password;

    await user.save();

    res.json({
      message: 'Profile updated successfully.',
      user: user.toSafeObject()
    });
  } catch (error) {
    res.status(500).json({ message: 'Profile update failed.', error: error.message });
  }
};

const addMember = async (req, res) => {
  try {
    const { email, password, fullName, phoneNumber, role, isSubscribed } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Member already exists.' });
    }

    const user = await User.create({
      fullName: fullName || email.split('@')[0],
      email,
      password,
      phoneNumber: phoneNumber || '',
      role: normalizeRole(role || 'student'),
      isSubscribed: isSubscribed !== undefined ? isSubscribed : true
    });

    res.status(201).json({
      message: 'Member added successfully.',
      user: user.toSafeObject()
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add member.', error: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  addMember
};
