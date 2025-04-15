const express = require('express');
const router = express.Router();
const FoodItem = require('../models/FoodItem');
const User = require('../models/User'); // Added User model
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { v2: cloudinary } = require('cloudinary'); // Import Cloudinary

// Configure Cloudinary (ensure environment variables are set in .env)
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

// --- Multer Configuration ---
// Switch to memoryStorage to handle file buffer directly
const storage = multer.memoryStorage();

// Basic file filter (optional: add more specific checks like mime type)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
    // It's often helpful to log the rejected file type
    // console.log('Rejected file type:', file.mimetype);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// --- Authentication Middleware ---
const requireAuth = (req, res, next) => {
  const { authorization } = req.headers;
  // authorization === 'Bearer <token>'

  // console.log('[Auth Middleware] Authorization Header:', authorization); // Log header

  if (!authorization) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authorization.split(' ')[1];

  try {
    // Verify the token using the secret
    // Make sure JWT_SECRET is loaded from your .env file in server.js
    const { userId, username } = jwt.verify(token, process.env.JWT_SECRET);

    // console.log('[Auth Middleware] Token Verified - User:', { userId, username }); // Log successful verification

    // Attach user info to the request object
    // TODO: Optionally fetch full user data from DB if needed: req.user = await User.findById(userId).select('_id username email');
    req.user = { _id: userId, username }; // Attach minimal user info
    next(); // Proceed to the next middleware or route handler

  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    res.status(401).json({ error: 'Request is not authorized' });
  }
};

// GET /marketplace
router.get('/marketplace', async (req, res) => {
  try {
    const items = await FoodItem.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch food items' });
  }
});

// --- User-Specific Routes (Protected) ---

// GET /user/me/listings - Fetch listings for the logged-in user
router.get('/user/me/listings', requireAuth, async (req, res) => {
  try {
    // req.user should be populated by requireAuth middleware
    const userId = req.user._id;
    const userListings = await FoodItem.find({ userId }).sort({ createdAt: -1 }); // Find items by userId
    console.log(`[GET /user/me/listings] Found ${userListings.length} listings for userId: ${userId}`); // Log user ID and count
    res.json(userListings);
  } catch (err) {
    console.error('Error fetching user-specific listings:', err);
    res.status(500).json({ error: 'Failed to fetch your listings', details: err.message });
  }
});

// POST /user/listings - Create a new listing for the logged-in user
router.post('/user/listings', requireAuth, upload.single('image'), async (req, res) => {
  try {
    console.log('Received POST /user/listings request');
    // console.log('Request Body:', req.body);
    // console.log('Uploaded File:', req.file);
    // console.log('Authenticated User:', req.user); // Check user info from authMiddleware

    // 1. Check if listingDetails exists and parse it
    if (!req.body.listingDetails) {
        console.error('Error: listingDetails missing from request body.');
        return res.status(400).json({ error: 'Missing listing details in request.' });
    }

    let listingData;
    try {
        listingData = JSON.parse(req.body.listingDetails);
        console.log('Parsed listingData:', listingData);
    } catch (parseError) {
        console.error('Error parsing listingDetails JSON:', parseError);
        return res.status(400).json({ error: 'Invalid format for listing details.', details: parseError.message });
    }

    // 2. Validate required fields (add more checks as needed based on your model)
    const requiredFields = ['title', 'description', 'price', 'unitType', 'origin', 'expiryDate', 'contactMethod'];
    for (const field of requiredFields) {
        if (!listingData[field]) {
            console.error(`Validation Error: Missing required field '${field}'.`);
            return res.status(400).json({ error: `Missing required field: ${field}` });
        }
    }
     // Validate unitType-specific fields
     if (listingData.unitType === 'quantity' && (!listingData.quantity || listingData.quantity < 1)) {
         console.error('Validation Error: Missing or invalid quantity for unitType quantity.');
         return res.status(400).json({ error: 'Quantity is required and must be at least 1 when unit type is quantity.' });
     }
     if (listingData.unitType === 'size' && !listingData.sizeMeasurement) {
         console.error('Validation Error: Missing sizeMeasurement for unitType size.');
         return res.status(400).json({ error: 'Size measurement is required when unit type is size.' });
     }

    // 3. Fetch User's Contact Info
    const currentUser = await User.findById(req.user._id).select('email phone');
    if (!currentUser) {
        console.error(`Error: Could not find user with userId: ${req.user._id}`);
        return res.status(400).json({ error: 'User not found. Cannot create listing.' });
    }

    // Determine contact info based on contactMethod preference and available data
    let userContactInfo = ''; // Initialize
    const preferredMethod = listingData.contactMethod; // Method selected in the form

    if (preferredMethod === 'Phone' && currentUser.phone) {
        userContactInfo = currentUser.phone; // Use phone if preferred and available
    } else if (preferredMethod === 'Email' && currentUser.email) {
        userContactInfo = currentUser.email; // Use email if preferred and available
    } else {
        // Fallback logic if preferred method data is missing or no method specified
        if (currentUser.email) {
            userContactInfo = currentUser.email; // Prioritize email as fallback
            console.log(`[Contact Info] Using fallback email for user ${req.user._id}`);
        } else if (currentUser.phone) {
            userContactInfo = currentUser.phone; // Use phone if email is also missing
            console.log(`[Contact Info] Using fallback phone for user ${req.user._id}`);
        }
    }

    if (!userContactInfo) { // Final check: Ensure we have some contact info
        console.error(`Error: Could not determine any contact info (email or phone) for user ${req.user._id}.`);
        // Prevent listing creation if no contact info can be found on the user profile
        return res.status(400).json({ error: 'User profile is missing contact information (email or phone). Please update your profile. Cannot create listing.' });
    }
    console.log(`[Contact Info] Using contactInfo for user ${req.user._id}: ${userContactInfo}`);

    // 4. Handle Image Upload to Cloudinary (if image exists)
    let imageUrl = null; // Default to null if no image is uploaded
    if (req.file) {
        console.log(`[Cloudinary] Uploading file from buffer: ${req.file.originalname}`);
        try {
            // Upload from buffer requires converting buffer to data URI or using upload_stream
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
            
            const uploadResult = await cloudinary.uploader.upload(dataURI, {
                // Optional: Add upload options like folder, public_id etc.
                // folder: "food_items" 
                // resource_type: 'auto' // Let Cloudinary detect resource type
            });
            imageUrl = uploadResult.secure_url; // Get the HTTPS URL from Cloudinary
            console.log(`[Cloudinary] Upload successful: ${imageUrl}`);
            // No temporary file to delete when using memoryStorage
        } catch (uploadError) {
            console.error('[Cloudinary] Upload Error:', uploadError);
            // Decide if you want to proceed without an image or return an error
            // return res.status(500).json({ error: 'Failed to upload image to cloud storage.', details: uploadError.message }); 
            // For now, let's proceed without image if upload fails
            imageUrl = null; // Ensure imageUrl is null if upload failed
            console.log('[Cloudinary] Proceeding without image due to upload error.');
        }
    } else {
        console.log('[Cloudinary] No image file provided in the request.');
    }

    // 5. Construct the new FoodItem object
    const newFoodItemData = {
      ...listingData,
      userId: req.user._id, // Add userId from authenticated user
      contactInfo: userContactInfo, // Add fetched contact info
      imageUri: imageUrl, // Use the Cloudinary URL or null
      location: (listingData.shareLocation && listingData.location?.coordinates?.length === 2) 
                ? { type: 'Point', coordinates: listingData.location.coordinates } 
                : null, // Set location or null based on shareLocation flag
    };
    // Remove shareLocation as it's not part of the schema
    delete newFoodItemData.shareLocation;

    // 6. Save to Database
    const foodItem = new FoodItem(newFoodItemData);
    await foodItem.save();
    console.log('FoodItem saved successfully:', foodItem._id);

    res.status(201).json(foodItem); // Respond with the created item

  } catch (error) {
     console.error('Error creating food item:', error);

     // Check for Mongoose validation errors specifically
     if (error.name === 'ValidationError') {
         // Log specific validation errors
         for (let field in error.errors) {
           console.error(`Validation Error Field: ${field}, Message: ${error.errors[field].message}`);
         }
         // Return a more specific validation error message
         // Extract the first error message or a generic one
         const firstErrorMessage = error.errors[Object.keys(error.errors)[0]]?.message || 'Validation failed. Please check your input.';
         return res.status(400).json({ error: 'Validation failed.', details: firstErrorMessage });
     }

     // General server error
     res.status(500).json({ error: 'Failed to add food item', details: error.message });
  }
});

// GET /user/listings/:id - Fetch a specific listing by ID for the logged-in user
router.get('/user/listings/:id', requireAuth, async (req, res) => {
  try {
    const listingId = req.params.id;
    const userId = req.user._id;

    console.log(`[GET /user/listings/:id] Attempting to fetch listing ${listingId} for user ${userId}`);

    const foodItem = await FoodItem.findById(listingId);

    if (!foodItem) {
      console.log(`[GET /user/listings/:id] Listing ${listingId} not found.`);
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Authorization check: Ensure the fetched item belongs to the requesting user
    if (foodItem.userId.toString() !== userId.toString()) {
      console.warn(`[GET /user/listings/:id] Authorization failed: User ${userId} attempted to access listing ${listingId} owned by ${foodItem.userId}`);
      return res.status(403).json({ error: 'Forbidden: You do not own this listing' });
    }

    console.log(`[GET /user/listings/:id] Listing ${listingId} fetched successfully for user ${userId}.`);
    res.json(foodItem); // Return the found listing

  } catch (error) {
    console.error(`[GET /user/listings/:id] Error fetching listing ${req.params.id}:`, error);
    // Handle potential CastError if the ID format is invalid
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid listing ID format' });
    }
    res.status(500).json({ error: 'Failed to fetch listing', details: error.message });
  }
});

// PUT /user/listings/:id - Update a specific listing for the logged-in user
router.put('/user/listings/:id', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const listingId = req.params.id;
    const userId = req.user._id;
    console.log(`[PUT /user/listings/:id] Attempting to update listing ${listingId} for user ${userId}`);

    // 1. Check if listingDetails exists and parse it
    if (!req.body.listingDetails) {
        console.error('[PUT /user/listings/:id] Validation Error: Missing listingDetails in request body.');
        return res.status(400).json({ error: 'Missing listingDetails in request body.' });
    }
    let listingData;
    try {
        listingData = JSON.parse(req.body.listingDetails);
        // console.log('[PUT /user/listings/:id] Parsed listingData:', listingData);
    } catch (parseError) {
        console.error('[PUT /user/listings/:id] Error parsing listingDetails JSON:', parseError);
        return res.status(400).json({ error: 'Invalid format for listingDetails.', details: parseError.message });
    }

    // 2. Find the existing listing
    const foodItem = await FoodItem.findById(listingId);

    if (!foodItem) {
      console.log(`[PUT /user/listings/:id] Listing ${listingId} not found.`);
      return res.status(404).json({ error: 'Listing not found' });
    }

    // 3. Authorization check: Ensure the listing belongs to the requesting user
    if (foodItem.userId.toString() !== userId.toString()) {
      console.warn(`[PUT /user/listings/:id] Authorization failed: User ${userId} attempted to update listing ${listingId} owned by ${foodItem.userId}`);
      return res.status(403).json({ error: 'Forbidden: You do not own this listing' });
    }

    // 4. Prepare update data (similar to POST, but merging with existing)
    const updateData = { ...listingData }; // Start with new data

    // --- QUANTITY HANDLING --- 
    // If unitType is 'size' and quantity is null (sent from frontend for empty input),
    // remove quantity from the update payload entirely to prevent validation issues.
    if (updateData.unitType === 'size' && updateData.quantity === null) {
      console.log('[PUT /user/listings/:id] unitType is size and quantity is null, removing quantity from update payload.');
      delete updateData.quantity;
    }
    // --- END QUANTITY HANDLING ---

    // Handle image update
    if (req.file) {
      console.log(`[Cloudinary] Uploading file from buffer for update: ${req.file.originalname}`);
      try {
        // Upload from buffer requires converting buffer to data URI or using upload_stream
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;

        const uploadResult = await cloudinary.uploader.upload(dataURI, {
          // Optional: Add upload options like folder, public_id etc.
          // folder: "food_items" 
          // resource_type: 'auto'
        });
        updateData.imageUri = uploadResult.secure_url; // Get the HTTPS URL from Cloudinary
        console.log(`[Cloudinary] Update upload successful: ${updateData.imageUri}`);
        // No temporary file to delete
      } catch (uploadError) {
        console.error('[Cloudinary] Update Upload Error:', uploadError);
        // Decide if you want to proceed without an image or return an error
        // return res.status(500).json({ error: 'Failed to upload image to cloud storage.', details: uploadError.message }); 
        // For now, let's proceed without image if upload fails
        updateData.imageUri = null; // Ensure imageUrl is null if upload failed
        console.log('[Cloudinary] Proceeding without image due to upload error.');
      }
    } else {
      updateData.imageUri = foodItem.imageUri; // Keep existing image if no new one uploaded
      // TODO: Add logic here if frontend sends a flag to specifically remove the image.
    }

    // Handle location update - CORRECTED LOGIC
    if (listingData.shareLocation && listingData.location && listingData.location.coordinates && listingData.location.coordinates.length === 2) {
        // Ensure coordinates are valid numbers before assigning
        const longitude = Number(listingData.location.coordinates[0]);
        const latitude = Number(listingData.location.coordinates[1]);
        if (!isNaN(longitude) && !isNaN(latitude)) {
            updateData.location = {
                type: 'Point',
                coordinates: [longitude, latitude]
            };
            console.log(`[PUT /user/listings/:id] Location updated: ${JSON.stringify(updateData.location)}`);
        } else {
            console.warn(`[PUT /user/listings/:id] Invalid coordinates received: ${JSON.stringify(listingData.location.coordinates)}, setting location to null.`);
            updateData.location = null;
        }
    } else {
        // If shareLocation is false, or location/coordinates are missing/invalid, set to null
        updateData.location = null;
        console.log(`[PUT /user/listings/:id] shareLocation is false or location data invalid, setting location to null.`);
    }
    // Remove shareLocation as it's not part of the schema
    delete updateData.shareLocation;

    // Handle contact info (re-evaluate based on current user data if necessary)
    // For simplicity, we might trust the contactMethod from the request, assuming
    // the backend can resolve the actual info. Or fetch user fresh.
    // Let's keep it simple for now and use the method from the updateData.
    // The backend logic for *using* this info during contact would fetch profile data.
    console.log(`[PUT /user/listings/:id] Updating with contactMethod: ${updateData.contactMethod}`);


    // Remove fields that shouldn't be directly updated or are derived
    delete updateData._id; // Don't try to update the ID
    delete updateData.userId; // User ownership shouldn't change
    delete updateData.createdAt; // Don't change creation date
    // updateData.updatedAt will be handled by mongoose timestamps

    // 5. Perform the update
    const updatedFoodItem = await FoodItem.findByIdAndUpdate(
      listingId,
      updateData,
      { new: true, runValidators: true } // Return updated doc, run schema validation
    );

    if (!updatedFoodItem) {
      // Should not happen if findById worked, but good practice
      console.error(`[PUT /user/listings/:id] Failed to update listing ${listingId} after finding it.`);
      return res.status(500).json({ error: 'Failed to update listing after finding it.' });
    }

    console.log(`[PUT /user/listings/:id] Listing ${listingId} updated successfully.`);
    res.json(updatedFoodItem); // Respond with the updated item

  } catch (error) {
    console.error(`[PUT /user/listings/:id] Error updating listing ${req.params.id}:`, error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid listing ID format' });
    }
    if (error.name === 'ValidationError') {
        const firstErrorMessage = error.errors[Object.keys(error.errors)[0]]?.message || 'Validation failed.';
        return res.status(400).json({ error: 'Validation failed.', details: firstErrorMessage });
    }
    res.status(500).json({ error: 'Failed to update listing', details: error.message });
  }
});

 // DELETE /user/listings/:id
 router.delete('/user/listings/:id', requireAuth, async (req, res) => {
   try {
    const deletedItem = await FoodItem.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ error: 'Food item not found' });
    }
    res.json({ message: 'Food item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete food item' });
  }
});

module.exports = router;
