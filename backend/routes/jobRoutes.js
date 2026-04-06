const express = require('express');
const router = express.Router();
const { createJob, getJobs, getMyJobs, getJobById, updateJob, deleteJob } = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('recruiter'), createJob);
router.get('/', getJobs);
router.get('/my', protect, authorize('recruiter'), getMyJobs);
router.get('/:id', getJobById);
router.put('/:id', protect, authorize('recruiter'), updateJob);
router.delete('/:id', protect, authorize('recruiter'), deleteJob);

module.exports = router;
