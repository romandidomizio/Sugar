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

//    // Generate JWT
//    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
//      expiresIn: '1h',
//    });

        // --- MODIFICATION HERE ---
        // Generate JWT - Include user._id as 'id' in the payload
        const payload = {
            id: user._id, // Add this line
            username: user.username // Keep username if needed, or remove if id is enough
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: '1h', // Or your preferred expiration
        });
        // --- END MODIFICATION ---

    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Get user profile
//router.get('/profile', authMiddleware, async (req, res) => {
//  try {
//    const user = await User.findOne({ username: req.user.username });
//    if (!user) {
//      return res.status(404).json({ message: 'User not found' });
//    }
//
//    res.json(user);
//  } catch (error) {
//    res.status(500).json({ message: 'Error fetching profile', error: error.message });
//  }
//});
// Get user profile (Updated Suggestion)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // Find user by ID from the JWT payload
    const user = await User.findById(req.user.id); // Use findById with req.user.id
    if (!user) {
      // Although unlikely if token is valid, still good practice
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user); // Balance is included automatically here
  } catch (error) {
    // Handle potential ObjectId format errors if req.user.id is invalid
    if (error.kind === 'ObjectId') {
       return res.status(400).json({ message: 'Invalid user ID format' });
    }
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

// Add funds to user balance
router.put('/balance', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id; // Get user ID from authenticated token payload

    // --- Input Validation ---
    // Check if amount is provided and is a positive number
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount specified. Amount must be a positive number.' });
    }

    // Round the amount to 2 decimal places to avoid floating point issues
    const amountToAdd = Math.round(amount * 100) / 100;

    // --- Database Update ---
    // Find the user by ID and atomically increment their balance
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { balance: amountToAdd } }, // Use $inc to add to the existing balance
      { new: true, runValidators: true } // Return the updated document and run schema validators
    );

    // --- Handle User Not Found ---
    if (!updatedUser) {
      // Should not happen if token is valid, but good safety check
      return res.status(404).json({ message: 'User not found' });
    }

    // --- Success Response ---
    // Return the updated user object (including the new balance)
    res.json(updatedUser);

  } catch (error) {
    // --- Error Handling ---
    console.error("Error adding balance:", error); // Log the error for debugging
    // Handle potential validation errors if you add min/max to balance schema
    if (error.name === 'ValidationError') {
         return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    res.status(500).json({ message: 'Error updating balance', error: error.message });
  }
});

// Example protected route
router.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

module.exports = router;
