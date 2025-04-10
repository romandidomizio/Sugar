require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const expressSanitizer = require('express-sanitizer');
const connectDB = require('./config/database');
const mongoose = require('mongoose');

// Import Messaging Routes
const messagingRoutes = require('./routes/messages');

const app = express();

// Connect to Database
connectDB();

// Database operation logging
mongoose.set('debug', true);

// Security Middleware
app.use(helmet()); // Adds various HTTP headers for security

// Enhanced request and response logging
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  console.log('Request body:', req.body);
  const originalSend = res.send;
  res.send = function (body) {
    console.log('Response body:', body);
    return originalSend.apply(this, arguments);
  };
  next();
});

// CORS configuration logging
app.use(cors({ 
  origin: '*',
  preflightContinue: true,
  optionsSuccessStatus: 204,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(expressSanitizer()); // Sanitize inputs

// Review authentication middleware
const authMiddleware = require('./middleware/authMiddleware');

// Routes
const userRoutes = require('./routes/userRoutes');
const foodItemsRoutes = require('./routes/foodItems');
app.use('/api/users', userRoutes);
app.use('/api', foodItemsRoutes);
app.use('/api/messages', messagingRoutes);

// Apply authMiddleware selectively to routes that require authentication
app.use('/api/users/profile', authMiddleware);

// Basic route
app.get('/', (req, res) => {
  res.send('Sugar Marketplace Backend - Secure and Ready!');
});

// Error handling and messaging
app.use((err, req, res, next) => {
  console.error('Error occurred:', err);
  res.status(err.status || 500).json({
    message: 'An error occurred',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    // Close database connection
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});