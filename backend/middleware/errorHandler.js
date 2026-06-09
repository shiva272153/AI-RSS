const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    const limitMessage = req.originalUrl.includes('profile-pic') 
      ? 'File too large. Maximum size is 200KB.' 
      : 'File too large. Maximum size is 5MB.';
    return res.status(400).json({ message: limitMessage });
  }

  // Multer file type error
  if (err.message === 'Only PDF and DOCX files are allowed') {
    return res.status(400).json({ message: err.message });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({ message: 'Duplicate field value entered' });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal Server Error'
  });
};

module.exports = errorHandler;
