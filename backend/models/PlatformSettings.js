const mongoose = require('mongoose');

const platformSettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    unique: true,
    default: 'global'
  },
  price: {
    type: Number,
    default: 500
  },
  currency: {
    type: String,
    default: '₹'
  },
  plans: [{
    name: String,
    amount: Number,
    description: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);
