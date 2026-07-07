require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const connectDB = require('./config/database');
const seedDatabase = require('./utils/seed');
const { PORT, CORS_ORIGIN } = require('./config/env');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

const authRoutes = require('./routes/auth');
const subscriptionRoutes = require('./routes/subscription');
const adminRoutes = require('./routes/admin');
const videoRoutes = require('./routes/video');
const User = require('./models/User');
const PlatformSettings = require('./models/PlatformSettings');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN.split(','),
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use('/api', apiLimiter);

// Health check
app.get('/api/health', async (req, res) => {
  const settings = await PlatformSettings.findOne({ key: 'global' });
  const usersCount = await User.countDocuments();
  res.json({
    status: 'ok',
    usersCount,
    currentPrice: settings?.price ?? 500
  });
});

// API routes
app.use('/auth', authRoutes);
app.use('/sub', subscriptionRoutes);
app.use('/admin', adminRoutes);
app.use('/video', videoRoutes);

// Backward-compatible settings endpoint
app.get('/settings', async (req, res) => {
  const settings = await PlatformSettings.findOne({ key: 'global' });
  res.json({
    price: settings?.price ?? 500,
    currency: settings?.currency ?? '₹'
  });
});

// Serve frontend static files
const frontendPath = path.resolve(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Route HTML pages
app.get('/', (req, res) => res.sendFile(path.join(frontendPath, 'pages/index.html')));
app.get('/:page.html', (req, res) => {
  res.sendFile(path.join(frontendPath, `pages/${req.params.page}.html`));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation Error', errors: err.errors });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate field value entered' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
