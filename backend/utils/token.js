const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN, AUTH_COOKIE_NAME } = require('../config/env');

const signToken = (userId, role) =>
  jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

const parseCookies = (cookieHeader = '') =>
  cookieHeader.split(';').reduce((acc, part) => {
    const [rawKey, ...rawValue] = part.trim().split('=');
    if (!rawKey) return acc;
    acc[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue.join('=') || '');
    return acc;
  }, {});

const getTokenFromRequest = (req) => {
  const headerToken = req.headers.authorization?.split(' ')[1];
  if (headerToken) return headerToken;
  const cookies = parseCookies(req.headers.cookie || '');
  return cookies[AUTH_COOKIE_NAME];
};

const setAuthCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const secureFlag = isProduction ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${secureFlag}`
  );
};

const clearAuthCookie = (res) => {
  res.setHeader('Set-Cookie', `${AUTH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
};

module.exports = {
  signToken,
  getTokenFromRequest,
  setAuthCookie,
  clearAuthCookie
};
