const Resume = require('../models/Resume');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:5001';

// @desc    Upload resume
// @route   POST /api/resumes/upload
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF or DOCX file' });
    }

    const fileType = req.file.originalname.endsWith('.pdf') ? 'pdf' : 'docx';

    // Check if user already has a resume — replace it
    const existingResume = await Resume.findOne({ userId: req.user._id });
    if (existingResume) {
      // Delete old file
      const oldFilePath = path.join(__dirname, '..', existingResume.filePath);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
      await Resume.deleteOne({ _id: existingResume._id });
    }

    // Create resume record
    const resume = await Resume.create({
      userId: req.user._id,
      fileName: req.file.originalname,
      filePath: 'uploads/' + req.file.filename,
      fileType: fileType
    });

    // Send file to ML engine for text extraction (with retry)
    try {
      const absolutePath = path.join(__dirname, '..', resume.filePath);
      const FormData = require('form-data');

      const sendToML = async () => {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(absolutePath), {
          filename: req.file.originalname,
          contentType: fileType === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });
        formData.append('file_type', fileType);

        return axios.post(`${ML_ENGINE_URL}/extract-text`, formData, {
          headers: formData.getHeaders(),
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: 30000
        });
      };

      let mlResponse;
      try {
        mlResponse = await sendToML();
      } catch (firstErr) {
        console.log('ML Engine first attempt failed, retrying...', firstErr.message);
        // Wait 1 second and retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        mlResponse = await sendToML();
      }

      resume.extractedText = mlResponse.data.extracted_text || '';
      resume.processedText = mlResponse.data.processed_text || '';
      resume.skills = mlResponse.data.skills || [];
      await resume.save();
      console.log(`Resume processed: ${resume.skills.length} skills found`);
    } catch (mlError) {
      console.error('ML Engine text extraction failed:', mlError.message);
      // Resume is still saved, just without extracted text
    }

    res.status(201).json(resume);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's resume
// @route   GET /api/resumes/my
const getMyResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'No resume found. Please upload your resume.' });
    }
    res.json(resume);
  } catch (error) {
    next(error);
  }
};

// @desc    Get resume by ID (for recruiters)
// @route   GET /api/resumes/:id
const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id).populate('userId', 'name email phone');
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.json(resume);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Delete file from disk
    const filePath = path.join(__dirname, '..', resume.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Resume.deleteOne({ _id: resume._id });
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadResume, getMyResume, getResumeById, deleteResume };
