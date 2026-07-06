const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Video = require('../models/Video');
const PlatformSettings = require('../models/PlatformSettings');
const { normalizeRole } = require('./helpers');

const DEFAULT_VIDEOS = [
  { title: 'Full-Stack Web Development: Introduction', description: 'Learn the basics of HTML, CSS, and JavaScript.', videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1631234567/sample.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80', duration: '12:45' },
  { title: 'Node.js & Express: Backend Mastery', description: 'Build powerful APIs and server-side applications.', videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1631234567/sample.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&q=80', duration: '18:20' },
  { title: 'React.js: UI Components & State', description: 'Create dynamic, high-performance user interfaces.', videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1631234567/sample.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80', duration: '15:10' },
  { title: 'Artificial Intelligence: Machine Learning 101', description: 'Introduction to neural networks and basics.', videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1631234567/sample.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80', duration: '22:30' },
  { title: 'Python for Data Science: Getting Started', description: 'Master Pandas, NumPy, and Matplotlib.', videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1631234567/sample.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80', duration: '09:45' },
  { title: 'Cloud Computing: AWS Essentials', description: 'Deploy your applications to the cloud.', videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1631234567/sample.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80', duration: '14:20' }
];

const migrateFromJson = async () => {
  const dbFile = path.join(__dirname, '..', 'db.json');
  if (!fs.existsSync(dbFile)) return;

  const data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));

  for (const legacyUser of data.users || []) {
    const email = legacyUser.email.toLowerCase();
    const exists = await User.findOne({ email });
    if (exists) continue;

    const doc = {
      fullName: legacyUser.fullName || legacyUser.email.split('@')[0],
      email,
      password: legacyUser.password,
      role: normalizeRole(legacyUser.role),
      phoneNumber: legacyUser.phoneNumber || '',
      isSubscribed: !!legacyUser.isSubscribed,
      createdAt: legacyUser.createdAt ? new Date(legacyUser.createdAt) : new Date(),
      updatedAt: new Date()
    };

    // Insert directly to preserve existing bcrypt hash
    await User.collection.insertOne(doc);
  }

  if ((await Video.countDocuments()) === 0 && (data.videos || []).length) {
    await Video.insertMany(data.videos.map(({ title, description, videoUrl, thumbnailUrl, duration }) => ({
      title, description, videoUrl, thumbnailUrl, duration
    })));
  }

  const jsonSettings = data.platformSettings || { price: 500, currency: '₹' };
  const settings = await PlatformSettings.findOne({ key: 'global' });
  if (!settings) {
    await PlatformSettings.create({
      key: 'global',
      price: jsonSettings.price,
      currency: jsonSettings.currency,
      plans: [{ name: 'Premium Plan', amount: jsonSettings.price, description: 'Lifetime access to all courses' }]
    });
  }
};

const seedDatabase = async () => {
  const adminExists = await User.findOne({ role: 'admin' });
  if (!adminExists) {
    await User.create({
      fullName: 'Skill Nova Admin',
      email: 'admin@skillnova.com',
      password: 'Admin@123',
      role: 'admin',
      phoneNumber: '917627043971',
      isSubscribed: true
    });
    console.log('Default admin created: admin@skillnova.com / Admin@123');
  }

  if ((await Video.countDocuments()) === 0) {
    await Video.insertMany(DEFAULT_VIDEOS);
    console.log('Default videos seeded.');
  }

  let settings = await PlatformSettings.findOne({ key: 'global' });
  if (!settings) {
    settings = await PlatformSettings.create({
      key: 'global',
      price: 500,
      currency: '₹',
      plans: [{ name: 'Premium Plan', amount: 500, description: 'Lifetime access to all courses' }]
    });
  }

  await migrateFromJson();
};

module.exports = seedDatabase;
