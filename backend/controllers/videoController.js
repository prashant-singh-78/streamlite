const Video = require('../models/Video');

const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    const hasAccess = req.user.isSubscribed || req.user.role === 'admin';

    const accessibleVideos = videos.map((v) => {
      const video = v.toObject();
      if (hasAccess) return video;
      const { videoUrl, ...publicData } = video;
      return { ...publicData, isPremium: true };
    });

    res.json(accessibleVideos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching videos.', error: error.message });
  }
};

const uploadVideo = async (req, res) => {
  try {
    const { title, description, videoUrl, thumbnailUrl, duration } = req.body;
    const video = await Video.create({ title, description, videoUrl, thumbnailUrl, duration });
    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ message: 'Upload failed.', error: error.message });
  }
};

module.exports = { getAllVideos, uploadVideo };
