const { WHATSAPP_NUMBER } = require('../config/env');

const buildWhatsAppUrl = ({ fullName, email, planName, amount }) => {
  const date = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const message = `Hello,
I want to purchase the ${planName} Subscription.

Name: ${fullName}
Email: ${email}
Selected Plan: ${planName} (₹${amount})
Date: ${date}

Please guide me regarding the payment process.`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

const normalizeRole = (role) => {
  if (role === 'user') return 'student';
  if (role === 'admin') return 'admin';
  return 'student';
};

module.exports = { buildWhatsAppUrl, normalizeRole };
