require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillnova',
  JWT_SECRET: process.env.JWT_SECRET || 'skill_nova_jwt_secret_change_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  AUTH_COOKIE_NAME: 'skill_nova_token',
  WHATSAPP_NUMBER: process.env.WHATSAPP_NUMBER || '917627043971',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  NODE_ENV: process.env.NODE_ENV || 'development'
};
