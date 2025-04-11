const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const { validateRegistration, validateLogin } = require('../utils/validation');
const multer = require('multer');
const path = require('path');

// Configure storage for multer
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/profile-photos/');
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File filter for images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB max size
  },
  fileFilter: fileFilter
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
const dir = './uploads/profile-photos';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

// Add this new route for photo upload
router.post('/upload-photo', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const photoUrl = `/uploads/profile-photos/${req.file.filename}`;

    const user = await User.findOneAndUpdate(
      { username: req.user.username },
      { photo: photoUrl },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ photo: photoUrl, user });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading photo', error: error.message });
  }
});

// Registration endpoint
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, email, phone } = req.body;

    // Validate input
    const { isValid, errors } = validateRegistration(username, password, email, phone);
    if (!isValid) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }

    // Create new user
    const newUser = new User({
      username,
      password,
      name,
      email,
      phone
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    const { isValid, errors } = validateLogin(username, password);
    if (!isValid) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Check password
    const isPasswordValid = await user.isValidPassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Generate JWT
    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    const user = await User.findOneAndUpdate(
      { username: req.user.username },
      { name, email, phone },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Example protected route
router.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

module.exports = router;
