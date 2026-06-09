const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, deleteAccount, uploadProfilePic, deleteProfilePic, forgotPassword, verifyOTP, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const profilePicUpload = require('../middleware/profilePicMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.delete('/profile', protect, deleteAccount);
router.post('/profile-pic', protect, profilePicUpload.single('profilePic'), uploadProfilePic);
router.delete('/profile-pic', protect, deleteProfilePic);

// Password reset flow (all public — rate limited at server level)
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
