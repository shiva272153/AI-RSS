const Job = require('../models/Job');

// Escape special regex characters to prevent ReDoS attacks
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Create a job posting
// @route   POST /api/jobs
const createJob = async (req, res, next) => {
  try {
    const { title, company, description, requirements, requiredSkills, location, salary, jobType } = req.body;

    const job = await Job.create({
      recruiterId: req.user._id,
      title,
      company,
      description,
      requirements,
      requiredSkills: requiredSkills || [],
      location,
      salary,
      jobType
    });

    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active jobs
// @route   GET /api/jobs
const getJobs = async (req, res, next) => {
  try {
    const { search, jobType, location } = req.query;
    let query = { status: 'active' };

    if (search) {
      const escaped = escapeRegex(search);
      query.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { company: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } }
      ];
    }
    if (jobType) query.jobType = jobType;
    if (location) query.location = { $regex: escapeRegex(location), $options: 'i' };

    const jobs = await Job.find(query)
      .populate('recruiterId', 'name email')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

// @desc    Get recruiter's own jobs
// @route   GET /api/jobs/my
const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('recruiterId', 'name email');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    next(error);
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, recruiterId: req.user._id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found or not authorized' });
    }

    const allowedUpdates = ['title', 'company', 'description', 'requirements', 'requiredSkills', 'location', 'salary', 'jobType', 'status'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field];
      }
    });

    await job.save();
    res.json(job);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, recruiterId: req.user._id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found or not authorized' });
    }
    await Job.deleteOne({ _id: job._id });
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createJob, getJobs, getMyJobs, getJobById, updateJob, deleteJob };
