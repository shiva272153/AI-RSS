const express = require('express');
const router = express.Router();
const { uploadResume, getMyResume, getResumeById, deleteResume } = require('../controllers/resumeController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/upload', protect, authorize('candidate'), upload.single('resume'), uploadResume);
router.get('/my', protect, authorize('candidate'), getMyResume);
router.get('/:id', protect, getResumeById);
router.delete('/:id', protect, authorize('candidate'), deleteResume);

module.exports = router;
