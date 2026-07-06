const Subscription = require('../models/Subscription');
const User = require('../models/User');
const PlatformSettings = require('../models/PlatformSettings');
const { buildWhatsAppUrl } = require('../utils/helpers');

const getPlans = async (req, res) => {
  try {
    const settings = await PlatformSettings.findOne({ key: 'global' });
    const price = settings?.price ?? 500;
    const plans = settings?.plans?.length
      ? settings.plans
      : [{ name: 'Premium Plan', amount: price, description: 'Lifetime access to all courses' }];

    res.json({ plans, price, currency: settings?.currency || '₹' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch plans.', error: error.message });
  }
};

const buyPlan = async (req, res) => {
  try {
    const { planName, amount, paymentMethod } = req.body;
    const user = req.user;

    const subscription = await Subscription.create({
      userId: user._id,
      planName,
      amount: Number(amount),
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: paymentMethod || 'whatsapp'
    });

    const whatsappUrl = buildWhatsAppUrl({
      fullName: user.fullName || user.email,
      email: user.email,
      planName,
      amount
    });

    res.status(201).json({
      message: 'Subscription request submitted. Redirecting to WhatsApp.',
      subscription,
      whatsappUrl
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create subscription request.', error: error.message });
  }
};

const checkSubscription = async (req, res) => {
  try {
    const latest = await Subscription.findOne({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      isSubscribed: req.user.isSubscribed,
      subscription: latest
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to check subscription.', error: error.message });
  }
};

const cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user._id,
      status: { $in: ['pending', 'approved'] }
    }).sort({ createdAt: -1 });

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription request found.' });
    }

    subscription.status = 'cancelled';
    subscription.paymentStatus = 'refunded';
    await subscription.save();

    if (req.user.isSubscribed && subscription.status === 'approved') {
      await User.findByIdAndUpdate(req.user._id, { isSubscribed: false });
    }

    res.json({ message: 'Subscription cancelled.', subscription });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel subscription.', error: error.message });
  }
};

// Backward-compatible subscribe endpoint
const legacySubscribe = async (req, res) => {
  try {
    const settings = await PlatformSettings.findOne({ key: 'global' });
    const price = settings?.price ?? 500;
    const planName = 'Premium Plan';

    const subscription = await Subscription.create({
      userId: req.user._id,
      planName,
      amount: price,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: req.body?.paymentMethod || 'whatsapp'
    });

    const whatsappUrl = buildWhatsAppUrl({
      fullName: req.user.fullName || req.user.email,
      email: req.user.email,
      planName,
      amount: price
    });

    const acceptHeader = (req.headers.accept || '').toLowerCase();
    const wantsHtml = acceptHeader.includes('text/html') || acceptHeader.includes('application/xhtml+xml');

    if (wantsHtml) {
      return res.redirect(303, whatsappUrl);
    }

    res.json({
      message: 'Subscription request created.',
      subscription,
      whatsappUrl,
      user: req.user.toSafeObject()
    });
  } catch (error) {
    res.status(500).json({ message: 'Subscription failed.', error: error.message });
  }
};

module.exports = {
  getPlans,
  buyPlan,
  checkSubscription,
  cancelSubscription,
  legacySubscribe
};
