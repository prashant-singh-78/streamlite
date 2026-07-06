const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Video = require('../models/Video');
const PlatformSettings = require('../models/PlatformSettings');
const { normalizeRole } = require('../utils/helpers');

const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users.map((u) => u.toSafeObject()));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users.', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete admin account.' });

    await Subscription.deleteMany({ userId: user._id });
    await user.deleteOne();

    res.json({ message: 'Student deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user.', error: error.message });
  }
};

const getSubscriptions = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const subscriptions = await Subscription.find(filter)
      .populate('userId', 'fullName email phoneNumber')
      .sort({ createdAt: -1 });

    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch subscriptions.', error: error.message });
  }
};

const updateSubscriptionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) return res.status(404).json({ message: 'Subscription not found.' });

    subscription.status = status;
    if (status === 'approved') {
      subscription.paymentStatus = 'paid';
      await User.findByIdAndUpdate(subscription.userId, { isSubscribed: true });
    } else if (status === 'rejected' || status === 'cancelled') {
      await User.findByIdAndUpdate(subscription.userId, { isSubscribed: false });
    }

    await subscription.save();

    res.json({ message: `Subscription ${status}.`, subscription });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update subscription.', error: error.message });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const [
      totalStudents,
      subscribedStudents,
      totalVideos,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      newRequests
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', isSubscribed: true }),
      Video.countDocuments(),
      Subscription.countDocuments({ status: 'pending' }),
      Subscription.countDocuments({ status: 'approved' }),
      Subscription.countDocuments({ status: 'rejected' }),
      Subscription.countDocuments({
        status: 'pending',
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
    ]);

    res.json({
      totalStudents,
      subscribedStudents,
      totalVideos,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      newRequests
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analytics.', error: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { price } = req.body;
    if (!price && price !== 0) {
      return res.status(400).json({ message: 'Price is required.' });
    }

    const settings = await PlatformSettings.findOneAndUpdate(
      { key: 'global' },
      {
        price: Number(price),
        plans: [{ name: 'Premium Plan', amount: Number(price), description: 'Lifetime access to all courses' }]
      },
      { new: true, upsert: true }
    );

    res.json({ message: 'Price updated successfully.', settings });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update settings.', error: error.message });
  }
};

const getPublicSettings = async (req, res) => {
  try {
    const settings = await PlatformSettings.findOne({ key: 'global' });
    res.json({
      price: settings?.price ?? 500,
      currency: settings?.currency ?? '₹'
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch settings.', error: error.message });
  }
};

const grantAccess = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.isSubscribed = true;
    await user.save();
    
    // Auto-approve pending subscriptions if any
    await Subscription.updateMany(
      { userId: user._id, status: 'pending' },
      { $set: { status: 'approved', paymentStatus: 'paid' } }
    );

    res.json({ message: 'Access granted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to grant access.', error: error.message });
  }
};

const getDataDump = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    const videos = await Video.find({});
    const subscriptions = await Subscription.find({});
    const settings = await PlatformSettings.find({});

    res.json({
      users,
      videos,
      subscriptions,
      settings
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate data dump.', error: error.message });
  }
};

module.exports = {
  getUsers,
  deleteUser,
  getSubscriptions,
  updateSubscriptionStatus,
  getAnalytics,
  updateSettings,
  getPublicSettings,
  grantAccess,
  getDataDump
};
