const validator = require('validator');

const validateRegistration = (username, password, email, phone) => {
  const errors = {};

  // Username validation
  if (!username || username.length < 3) {
    errors.username = 'Username must be at least 3 characters long';
  }

  // Password validation
  if (!password || password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
  }

  // Email validation
  if (!email || !validator.isEmail(email)) {
    errors.email = 'Invalid email address';
  }

  // Phone validation (optional, but if provided should be valid)
  if (phone && !validator.isMobilePhone(phone, 'any')) {
    errors.phone = 'Invalid phone number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const validateLogin = (username, password) => {
  const errors = {};

  // Username validation
  if (!username || username.trim() === '') {
    errors.username = 'Username is required';
  }

  // Password validation
  if (!password || password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

module.exports = {
  validateRegistration,
  validateLogin
};
