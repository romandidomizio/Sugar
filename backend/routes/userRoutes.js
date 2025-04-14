const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const multer = require('multer'); // Import multer
const path = require('path'); // Import path
const User = require('../models/User');
const FoodItem = require('../models/FoodItem'); // Make sure FoodItem is imported
const authMiddleware = require('../middleware/authMiddleware');
const { validateRegistration, validateLogin } = require('../utils/validation');

// Import the json parser middleware
const jsonParser = express.json();

// --- Multer Configuration ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Save files to the 'uploads' directory
  },
  filename: function (req, file, cb) {
    // Create a unique filename: image-<timestamp>.<original_extension>
    cb(null, `image-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });
// --- End Multer Configuration ---

// Registration endpoint
// Apply JSON parsing middleware specifically for this route
router.post('/register', jsonParser, async (req, res) => {
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
// Apply JSON parsing middleware specifically for this route
router.post('/login', jsonParser, async (req, res) => {
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
    // Include both username and userId (_id) in the token payload
    const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '1h', // Keep token expiration reasonable
    });

    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  // Note: The authMiddleware might need adjustment if it only expects/attaches username.
  // Let's assume it correctly verifies the token and makes payload available (e.g., req.user.userId)
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
router.put('/profile', authMiddleware, jsonParser, async (req, res) => {
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

// POST route for creating a new listing
// Apply multer middleware for single image upload with field name 'image'
router.post('/listings', authMiddleware, upload.single('image'), async (req, res) => {
  console.log('<<<<< ENTERING POST /listings HANDLER (v2) >>>>>'); // Add this test log
  console.log('[POST /user/listings] Raw req.body:', JSON.stringify(req.body, null, 2));
  console.log('[POST /user/listings] Raw req.file:', JSON.stringify(req.file, null, 2));

  // Basic validation for required fields
  // Adjust required fields based on form structure (image handled by multer)
  const requiredFields = ['title', 'producer', 'price', 'description', 'origin', 'expiryDate', 'contactMethod', 'unitType']; // Add unitType as required

  // Extract fields from request body
  const {
    title,
    producer,
    price,
    description,
    origin,
    expiryDate,
    contactMethod,
    certifications,
    unitType,
    quantity,
    location,
    shareLocation,
    contactInfo
  } = req.body;

  // Validate required fields
  if (requiredFields.some(field => !req.body[field])) {
    // More specific error message
    const missing = requiredFields.filter(field => !req.body[field]);
    console.error('[POST /user/listings] Missing required fields:', missing);
    return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
  }

  // Improved Certifications Parsing
  let certificationsArray = [];
  const rawCertifications = req.body.certifications; // Get from body
  if (rawCertifications) {
    if (Array.isArray(rawCertifications)) {
      certificationsArray = rawCertifications; // Already an array
    } else if (typeof rawCertifications === 'string') {
      try {
        const parsed = JSON.parse(rawCertifications);
        certificationsArray = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        // If JSON parsing fails, treat it as a single string certification
        certificationsArray = [rawCertifications];
      }
    } else {
      // Handle other types if necessary, or default to empty/single
      certificationsArray = [String(rawCertifications)];
    }
  }

  // Construct listing details object
  const imageUriToSave = req.file ? req.file.path.replace(/\\/g, '/') : null; // Ensure consistent slashes
  const finalImageUri = imageUriToSave?.startsWith('/') 
    ? imageUriToSave.substring(1) 
    : imageUriToSave;

  console.log('[POST /user/listings] imageUri to be saved:', finalImageUri);

  const listingDetails = {
    title,
    producer,
    price,
    description,
    origin,
    certifications: certificationsArray, 
    expiryDate,
    contactMethod: contactMethod, // Use destructured variable
    shareLocation: shareLocation === 'true' || shareLocation === true, // Accept string 'true' or boolean true
    location: null, // Location is handled separately if shareLocation is true
    imageUri: finalImageUri, // Use the path without leading slash
    userId: req.user.userId,
    unitType,
    quantity,
    contactInfo: req.body.contactInfo
  };

  // Handle Location Data
  let locationData = null;

  // Use the processed boolean value from listingDetails
  if (listingDetails.shareLocation && req.body.location) {
    try {
      const parsedLocation = JSON.parse(req.body.location);
      if (parsedLocation && typeof parsedLocation.latitude === 'number' && typeof parsedLocation.longitude === 'number') {
        // Format as GeoJSON Point: [longitude, latitude]
        locationData = {
          type: 'Point',
          coordinates: [parsedLocation.longitude, parsedLocation.latitude]
        };
        listingDetails.location = locationData; // Add location if valid
        console.log('[POST /user/listings] Parsed Location:', locationData);
      } else {
        console.warn('[POST /user/listings] Invalid location data format received:', req.body.location);
      }
    } catch (parseError) {
      console.error('[POST /user/listings] Error parsing location JSON:', parseError);
      // Decide if this should be a user-facing error or just a warning
      // For now, we'll just log it and proceed without location
    }
  }

  // --- DEBUG LOGGING BEFORE SAVE --- 
  console.log('[POST /user/listings] --- Values Before Saving ---');
  console.log('[POST /user/listings] req.body:', JSON.stringify(req.body, null, 2));
  console.log('[POST /user/listings] req.file:', JSON.stringify(req.file, null, 2));
  console.log('[POST /user/listings] shareLocation to be saved:', listingDetails.shareLocation);
  console.log('[POST /user/listings] contactMethod to be saved:', listingDetails.contactMethod);
  console.log('[POST /user/listings] imageUri to be saved:', listingDetails.imageUri);
  console.log('[POST /user/listings] Full listingDetails object:', JSON.stringify(listingDetails, null, 2));
  // --- END DEBUG LOGGING --- 

  // Create a new food item instance with combined details
  const newListing = new FoodItem(listingDetails);

  try {
    await newListing.save();
    res.status(201).json({ message: 'Listing created successfully', listing: newListing });
  } catch (error) {
    res.status(500).json({ message: 'Error creating listing', error: error.message });
  }
});

// GET route to fetch listings for the logged-in user
router.get('/me/listings', authMiddleware, async (req, res) => {
  console.log(`[GET /user/me/listings] Request received for userId: ${req.user.userId}`);
  try {
    const userId = req.user.userId; // Extract userId from the token payload
    // Find listings belonging to the user, sort by newest first
    const listings = await FoodItem.find({ userId }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching listings', error: error.message });
  }
});

// --- Helper function for error responses ---
const handleError = (res, status, message) => {
  console.error(message);
  return res.status(status).json({ error: message });
};

// --- PUT Update a specific listing owned by the user ---
// Path: /api/user/listings/:id
// Requires: Authentication, Multer for optional image update
router.put('/listings/:id', upload.single('image'), authMiddleware, async (req, res) => {
  const listingId = req.params.id;
  // Ensure req.user and req.user.userId exist AFTER authMiddleware runs
  if (!req.user || !req.user.userId) { 
      console.error('[API] Authentication error: req.user.userId missing after authMiddleware.');
      return res.status(401).json({ error: 'Authentication failed.' });
  }
  const userId = req.user.userId; 
  console.log(`[API] PUT /user/listings/${listingId} request received from user ${userId}`);

  try {
      // 1. Find the existing listing
      const listing = await FoodItem.findById(listingId);

      if (!listing) {
          console.log(`[API] Update failed: Listing ${listingId} not found.`);
          return res.status(404).json({ error: 'Listing not found' });
      }

      // 2. Check ownership using the correct field name
      if (listing.userId.toString() !== userId) { 
          console.log(`[API] Update failed: User ${userId} does not own listing ${listingId}. Owner is ${listing.userId.toString()}`);
          return res.status(403).json({ error: 'You are not authorized to update this listing' });
      }

      // 3. Parse listing details from FormData
      let updatedDetails;
      if (req.body.listingDetails) {
          try {
              updatedDetails = JSON.parse(req.body.listingDetails);
              console.log('[API] Parsed updatedDetails:', updatedDetails);
          } catch (parseError) {
              console.error('[API] Error parsing listingDetails JSON:', parseError);
              return res.status(400).json({ error: 'Invalid listing details format.' });
          }
      } else {
          console.log('[API] Update failed: listingDetails missing from request body.');
          return res.status(400).json({ error: 'Missing listing details.' });
      }

      // 4. Update listing fields (excluding owner)
      listing.title = updatedDetails.title || listing.title;
      listing.producer = updatedDetails.producer || listing.producer;
      listing.price = updatedDetails.price !== undefined ? Number(updatedDetails.price) : listing.price;
      listing.description = updatedDetails.description || listing.description;
      listing.origin = updatedDetails.origin || listing.origin;
      listing.certifications = updatedDetails.certifications || listing.certifications;
      listing.unitType = updatedDetails.unitType || listing.unitType;
      listing.quantity = updatedDetails.quantity !== undefined ? Number(updatedDetails.quantity) : listing.quantity;
      listing.sizeMeasurement = updatedDetails.sizeMeasurement || listing.sizeMeasurement;
      listing.expiryDate = updatedDetails.expiryDate ? new Date(updatedDetails.expiryDate) : listing.expiryDate;
      listing.contactMethod = updatedDetails.contactMethod || listing.contactMethod;
      listing.contactInfo = updatedDetails.contactInfo || listing.contactInfo; // Assuming contactInfo is updated
      listing.shareLocation = updatedDetails.shareLocation !== undefined ? updatedDetails.shareLocation : listing.shareLocation;
      listing.location = updatedDetails.location || listing.location; // Update location if provided

      // Handle potential deletion of location if shareLocation becomes false
      if (listing.shareLocation === false) {
          listing.location = null;
      }

      // 5. Handle optional image update
      if (req.file) {
          console.log(`[API] New image uploaded for listing ${listingId}: ${req.file.path}`);
          // TODO: Optionally delete the old image file from storage
          listing.imageUri = req.file.path; // Update image path
      } else {
          console.log(`[API] No new image uploaded for listing ${listingId}. Keeping existing image.`);
      }

      // 6. Save the updated listing
      const savedListing = await listing.save();
      console.log(`[API] Listing ${listingId} updated successfully.`);
      res.status(200).json(savedListing);

  } catch (error) {
      console.error(`[API] Error updating listing ${listingId}:`, error);
      if (error.name === 'CastError') {
           return res.status(400).json({ error: 'Invalid listing ID format' });
      }
      if (error.name === 'ValidationError') {
          return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error while updating listing' });
  }
});

// --- DELETE a specific listing owned by the user ---
// Path: /api/user/listings/:id
// Requires: Authentication
router.delete('/listings/:id', authMiddleware, async (req, res) => {
  const listingId = req.params.id;
  const userId = req.user.id; // From authMiddleware

  console.log(`[API] Attempting to delete listing ${listingId} by user ${userId}`);

  try {
    // Find the listing and ensure it belongs to the requesting user
    const listing = await FoodItem.findOne({ _id: listingId, userId: userId });

    if (!listing) {
      // Either listing doesn't exist or doesn't belong to the user
      return handleError(res, 404, 'Listing not found or you do not have permission to delete it.');
    }

    // Listing found and belongs to the user, proceed with deletion
    await FoodItem.findByIdAndDelete(listingId);

    console.log(`[API] Successfully deleted listing ${listingId}`);
    res.status(200).json({ message: 'Listing deleted successfully' });

  } catch (error) {
    // Handle potential errors like invalid ObjectId format or DB issues
    handleError(res, 500, `Server error deleting listing: ${error.message}`);
  }
});

module.exports = router;
