const Match = require('../models/Match');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const axios = require('axios');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:5001';

// @desc    Calculate match between a candidate's resume and a specific job
// @route   POST /api/matches/calculate/:jobId
const calculateMatch = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const resume = await Resume.findOne({ userId: req.user._id });
    if (!resume) {
      return res.status(400).json({ message: 'Please upload your resume first' });
    }

    if (!resume.extractedText && !resume.processedText) {
      return res.status(400).json({ message: 'Resume text has not been extracted yet. Please re-upload your resume.' });
    }

    // Call ML engine for matching
    try {
      const mlResponse = await axios.post(`${ML_ENGINE_URL}/calculate-match`, {
        resume_text: resume.processedText || resume.extractedText,
        job_description: `${job.title} ${job.description} ${job.requirements}`,
        resume_skills: resume.skills,
        required_skills: job.requiredSkills
      });

      const { match_score, matched_skills, missing_skills } = mlResponse.data;

      // Upsert match record
      const match = await Match.findOneAndUpdate(
        { resumeId: resume._id, jobId: job._id },
        {
          resumeId: resume._id,
          jobId: job._id,
          candidateId: req.user._id,
          matchScore: Math.round(match_score * 100) / 100,
          matchedSkills: matched_skills,
          missingSkills: missing_skills
        },
        { upsert: true, new: true }
      );

      res.json(match);
    } catch (mlError) {
      console.error('ML Engine match calculation failed:', mlError.message);
      return res.status(500).json({ message: 'Failed to calculate match. ML engine may be offline.' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate matches for ALL resumes against a specific job (recruiter)
// @route   POST /api/matches/calculate-all/:jobId
const calculateAllMatches = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, recruiterId: req.user._id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found or not authorized' });
    }

    const resumes = await Resume.find({ extractedText: { $ne: '' } }).populate('userId', 'name email');
    if (resumes.length === 0) {
      return res.status(400).json({ message: 'No resumes available for matching' });
    }

    const results = [];

    for (const resume of resumes) {
      try {
        const mlResponse = await axios.post(`${ML_ENGINE_URL}/calculate-match`, {
          resume_text: resume.processedText || resume.extractedText,
          job_description: `${job.title} ${job.description} ${job.requirements}`,
          resume_skills: resume.skills,
          required_skills: job.requiredSkills
        });

        const { match_score, matched_skills, missing_skills } = mlResponse.data;

        const match = await Match.findOneAndUpdate(
          { resumeId: resume._id, jobId: job._id },
          {
            resumeId: resume._id,
            jobId: job._id,
            candidateId: resume.userId._id,
            matchScore: Math.round(match_score * 100) / 100,
            matchedSkills: matched_skills,
            missingSkills: missing_skills
          },
          { upsert: true, new: true }
        );

        results.push({
          candidateName: resume.userId.name,
          candidateEmail: resume.userId.email,
          matchScore: match.matchScore,
          matchedSkills: match.matchedSkills,
          missingSkills: match.missingSkills
        });
      } catch (mlError) {
        console.error(`Match calculation failed for resume ${resume._id}:`, mlError.message);
      }
    }

    // Sort by score descending
    results.sort((a, b) => b.matchScore - a.matchScore);
    res.json({ jobTitle: job.title, totalCandidates: results.length, results });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all candidates ranked for a job
// @route   GET /api/matches/job/:jobId
const getMatchesByJob = async (req, res, next) => {
  try {
    const matches = await Match.find({ jobId: req.params.jobId })
      .populate('candidateId', 'name email phone')
      .populate('resumeId', 'fileName skills')
      .sort({ matchScore: -1 });

    res.json(matches);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current candidate's all matches
// @route   GET /api/matches/my
const getMyMatches = async (req, res, next) => {
  try {
    const matches = await Match.find({ candidateId: req.user._id })
      .populate('jobId', 'title company location jobType salary')
      .sort({ matchScore: -1 });

    res.json(matches);
  } catch (error) {
    next(error);
  }
};

// @desc    Get specific match details
// @route   GET /api/matches/:id
const getMatchById = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('candidateId', 'name email phone')
      .populate('jobId', 'title company description requiredSkills')
      .populate('resumeId', 'fileName skills extractedText');

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    res.json(match);
  } catch (error) {
    next(error);
  }
};

module.exports = { calculateMatch, calculateAllMatches, getMatchesByJob, getMyMatches, getMatchById };
