const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendOTPEmail } = require('../utils/emailService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register new user
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({ name, email, password, role, phone });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      profilePic: user.profilePic,
      token: generateToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      profilePic: user.profilePic,
      token: generateToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, password } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      user.password = password; // mongoose schema hook will hash it automatically
    }

    await user.save();
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      profilePic: user.profilePic
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send OTP for password reset
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal whether email exists (security best practice)
      return res.json({ message: 'If an account with that email exists, an OTP has been sent.' });
    }

    // Delete any existing OTP for this email
    await OTP.deleteMany({ email: user.email });

    // Generate 6-digit OTP
    const otpCode = crypto.randomInt(100000, 999999).toString();

    // Save hashed OTP to DB
    await OTP.create({ email: user.email, otp: otpCode });

    // Send OTP via email
    await sendOTPEmail(user.email, otpCode, user.name);

    res.json({ message: 'If an account with that email exists, an OTP has been sent.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const otpRecord = await OTP.findOne({ email: email.toLowerCase() });
    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Check max attempts (prevent brute force)
    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'Too many failed attempts. Please request a new OTP.' });
    }

    // Verify OTP
    const isValid = await otpRecord.compareOTP(otp);
    if (!isValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({
        message: `Invalid OTP. ${5 - otpRecord.attempts} attempts remaining.`
      });
    }

    // Generate short-lived reset token (15 minutes)
    const resetToken = jwt.sign(
      { email: otpRecord.email, purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    res.json({ message: 'OTP verified successfully', resetToken });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using reset token
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Reset link has expired. Please request a new OTP.' });
    }

    if (decoded.purpose !== 'password-reset') {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    // Find user and update password
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save(); // pre-save hook will hash it

    // Clean up any remaining OTPs for this email
    await OTP.deleteMany({ email: decoded.email });

    res.json({ message: 'Password reset successful. You can now sign in with your new password.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/auth/profile
const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'candidate') {
      const Resume = require('../models/Resume');
      const Match = require('../models/Match');
      const path = require('path');
      const fs = require('fs');

      // Find all resumes of candidate
      const resumes = await Resume.find({ userId });
      for (const resume of resumes) {
        const filePath = path.join(__dirname, '..', resume.filePath);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            console.error('Error deleting file:', filePath, err.message);
          }
        }
      }

      // Delete resumes and matches
      await Resume.deleteMany({ userId });
      await Match.deleteMany({ candidateId: userId });
    } else if (user.role === 'recruiter') {
      const Job = require('../models/Job');
      const Match = require('../models/Match');

      // Find recruiter's jobs
      const jobs = await Job.find({ recruiterId: userId });
      const jobIds = jobs.map(j => j._id);

      // Delete jobs and matches associated with those jobs
      await Job.deleteMany({ recruiterId: userId });
      await Match.deleteMany({ jobId: { $in: jobIds } });
    }

    // Delete profile pic file from disk if exists
    if (user.profilePic) {
      const path = require('path');
      const fs = require('fs');
      const picPath = path.join(__dirname, '..', user.profilePic);
      if (fs.existsSync(picPath)) {
        try {
          fs.unlinkSync(picPath);
        } catch (err) {
          console.error('Error deleting profile pic file:', picPath, err.message);
        }
      }
    }

    // Delete user
    await User.deleteOne({ _id: userId });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile picture
// @route   POST /api/auth/profile-pic
const uploadProfilePic = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file (JPEG, PNG, WEBP)' });
    }

    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old profile picture if exists
    if (user.profilePic) {
      const fs = require('fs');
      const path = require('path');
      const oldPath = path.join(__dirname, '..', user.profilePic);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (err) {
          console.error('Failed to delete old profile pic:', oldPath, err.message);
        }
      }
    }

    user.profilePic = 'uploads/' + req.file.filename;
    await user.save();

    res.json({
      message: 'Profile picture uploaded successfully',
      profilePic: user.profilePic
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete profile picture
// @route   DELETE /api/auth/profile-pic
const deleteProfilePic = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.profilePic) {
      const fs = require('fs');
      const path = require('path');
      const picPath = path.join(__dirname, '..', user.profilePic);
      if (fs.existsSync(picPath)) {
        try {
          fs.unlinkSync(picPath);
        } catch (err) {
          console.error('Failed to delete profile pic file:', picPath, err.message);
        }
      }
      user.profilePic = '';
      await user.save();
    }

    res.json({ message: 'Profile picture removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile, updateProfile, forgotPassword, verifyOTP, resetPassword, deleteAccount, uploadProfilePic, deleteProfilePic };

