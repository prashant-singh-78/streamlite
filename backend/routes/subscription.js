const express = require('express');
const {
  getPlans,
  buyPlan,
  checkSubscription,
  cancelSubscription,
  legacySubscribe
} = require('../controllers/subscriptionController');
const { verifyToken } = require('../middleware/auth');
const { buyPlanRules, handleValidation } = require('../utils/validation');

const router = express.Router();

router.get('/plans', getPlans);
router.post('/buy', verifyToken, buyPlanRules, handleValidation, buyPlan);
router.get('/status', verifyToken, checkSubscription);
router.post('/cancel', verifyToken, cancelSubscription);
router.post('/subscribe', verifyToken, legacySubscribe);

module.exports = router;
