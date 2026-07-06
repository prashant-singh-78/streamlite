const express = require('express');
const { getAllVideos, uploadVideo } = require('../controllers/videoController');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/all', verifyToken, getAllVideos);
router.post('/upload', verifyToken, isAdmin, uploadVideo);

module.exports = router;
