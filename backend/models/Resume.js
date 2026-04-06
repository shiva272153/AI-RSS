const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'docx'],
    required: true
  },
  extractedText: {
    type: String,
    default: ''
  },
  processedText: {
    type: String,
    default: ''
  },
  skills: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Resume', resumeSchema);
