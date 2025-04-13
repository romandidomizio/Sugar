const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const { validateRegistration, validateLogin } = require('../utils/validation');

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

router.get('/search', authMiddleware, async (req, res) => {
  const currentUsername = req.user.username; // Get username from JWT
  const searchQuery = req.query.q || ''; // Get search query from query params (?q=...)

  try {
    // Basic search: find users whose username contains the search query (case-insensitive)
    // Exclude the current user from the results
    // Limit results for performance (e.g., 20 users)
    const users = await User.find({
      username: { $regex: searchQuery, $options: 'i' }, // Case-insensitive regex search
      username: { $ne: currentUsername } // Exclude the current user
    })
    .select('username _id') // Only select username and ID
    .limit(20); // Limit the number of results

    res.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: 'Error searching users', error: error.message });
  }
});

module.exports = router;
