const express = require('express');
const router = express.Router();
const { calculateMatch, calculateAllMatches, getMatchesByJob, getMyMatches, getMatchById } = require('../controllers/matchController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/calculate/:jobId', protect, authorize('candidate'), calculateMatch);
router.post('/calculate-all/:jobId', protect, authorize('recruiter'), calculateAllMatches);
router.get('/job/:jobId', protect, authorize('recruiter'), getMatchesByJob);
router.get('/my', protect, authorize('candidate'), getMyMatches);
router.get('/:id', protect, getMatchById);

module.exports = router;
