const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  matchScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  matchedSkills: [{
    type: String
  }],
  missingSkills: [{
    type: String
  }]
}, {
  timestamps: true
});

// Compound index to prevent duplicate matches
matchSchema.index({ resumeId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('Match', matchSchema);
