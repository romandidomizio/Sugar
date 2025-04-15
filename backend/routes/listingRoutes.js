// backend/routes/listingRoutes.js
const express = require('express');
const router = express.Router();
const FoodItem = require('../models/FoodItem'); // Assuming FoodItem model is in ../models/FoodItem
const auth = require('../middleware/authMiddleware');
const multer = require('multer'); // Ensure multer is required
const { v2: cloudinary } = require('cloudinary'); // Import Cloudinary

// AI: Configure Cloudinary (ensure environment variables are set in .env)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// AI: Configure Multer for image uploads (similar to foodItems.js)
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

// --- GET all listings ---
// Path: /api/listings
// Access: Public (for marketplace display)
router.get('/', async (req, res) => {
    console.log('[API] GET /listings (all) request received.');
    try {
        // Fetch all items and sort by createdAt descending (newest first)
        const listings = await FoodItem.find({}).sort({ createdAt: -1 });
        
        console.log(`[API] Found ${listings.length} listings.`);
        
        res.status(200).json(listings); // Send listings directly
        
    } catch (error) {
        console.error('[API] Error fetching all listings:', error);
        res.status(500).json({ error: 'Server error while fetching listings' });
    }
});

// --- GET a specific listing by ID ---
// Path: /api/listings/:id
// Access: Public (anyone can view listing details)
router.get('/:id', async (req, res) => {
    console.log(`[API] GET /listings/${req.params.id} request received.`);
    try {
        const listing = await FoodItem.findById(req.params.id);

        if (!listing) {
            console.log(`[API] Listing not found for ID: ${req.params.id}`);
            return res.status(404).json({ error: 'Listing not found' });
        }

        console.log(`[API] Found listing for ID: ${req.params.id}`);
        
        res.status(200).json(listing); // Send listing directly

    } catch (error) {
        console.error(`[API] Error fetching listing ID ${req.params.id}:`, error);
        // Check for CastError (invalid ID format)
        if (error.name === 'CastError') {
             return res.status(400).json({ error: 'Invalid listing ID format' });
        }
        res.status(500).json({ error: 'Server error while fetching listing' });
    }
});

// --- AI: Add PUT route for updating a listing --- 
// Path: /api/listings/:id
// Access: Private (requires authentication, user must own the listing)
// Expects multipart/form-data due to potential image upload
router.put('/:id', auth, upload.single('image'), async (req, res) => {
    const { id } = req.params;
    // AI: Log the parsed req.body after multer middleware
    console.log('[API PUT /listings/:id] Parsed req.body:', req.body);
    // AI: Log if a file was received
    if (req.file) {
        console.log('[API PUT /listings/:id] Received file:', req.file.originalname);
    } else {
        console.log('[API PUT /listings/:id] No file received in request.');
    }

    // Correctly access userId from the JWT payload attached by authMiddleware
    const userId = req.user.userId; 
    console.log(`[API] PUT /listings/${id} request received from user ${userId}.`);

    try {
        const foodItem = await FoodItem.findById(id);

        if (!foodItem) {
            console.log(`[API] Update failed: Listing not found for ID: ${id}`);
            return res.status(404).json({ error: 'Listing not found' });
        }

        // --- Authorization Check: Ensure the logged-in user owns the listing --- 
        if (!foodItem.userId || foodItem.userId.toString() !== userId.toString()) { 
            console.log(`[API] Update denied: User ${userId} does not own listing ${id}. Owner is ${foodItem.userId}`);
            return res.status(403).json({ error: 'Not authorized to update this listing' });
        }

        console.log(`[API] User ${userId} authorized to update listing ${id}.`);

        // --- Handle potential image update ---
        let newImageUrl = foodItem.imageUri; // Default to existing image
        if (req.file) {
            console.log(`[Cloudinary] Updating image for listing ${id}. Uploading file: ${req.file.originalname}`);
            try {
                // Upload image buffer to Cloudinary
                const uploadResult = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { resource_type: 'image' }, // Optional: add folder, tags, etc.
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    uploadStream.end(req.file.buffer);
                });

                if (uploadResult && uploadResult.secure_url) {
                    newImageUrl = uploadResult.secure_url;
                    console.log(`[Cloudinary] New image uploaded successfully. URL: ${newImageUrl}`);
                } else {
                    console.error('[Cloudinary] Upload failed or did not return a secure_url.');
                    // Keep existing image if upload fails, or decide to return error
                }
            } catch (uploadError) {
                console.error('[Cloudinary] Error uploading image:', uploadError);
                // Keep existing image on error, or return 500
            }
        } else {
            console.log(`[API] No new image provided for update. Keeping existing image: ${newImageUrl}`);
        }

        // --- Update Fields --- 
        // Update simple fields directly from req.body
        const updatableFields = ['title', 'producer', 'description', 'price', 'origin', 'certifications', 'expiryDate', 'unitType', 'quantity', 'sizeMeasurement', 'contactMethod', 'shareLocation', 'location'];
        for (const field of updatableFields) {
            if (req.body[field] !== undefined) {
                const value = req.body[field];
                // Special handling for location (needs parsing if sent as JSON string)
                if (field === 'location' && value) {
                    try {
                        // Parse the location string into an object for GeoJSON structure
                        const parsedLocation = JSON.parse(value);
                        console.log(`[API] Parsed location for update:`, parsedLocation); // Log parsed object
                        // Ensure the structure matches the Mongoose schema (type: 'Point', coordinates: [lon, lat])
                        foodItem[field] = {
                            type: 'Point', // Explicitly set type
                            coordinates: [parsedLocation.longitude, parsedLocation.latitude] // Set coordinates in correct order [lon, lat]
                        };
                        console.log(`[API] Setting listing.location to:`, foodItem[field]); // Log the final structure
                    } catch (parseError) {
                        console.error(`[API] Error parsing location JSON string: ${value}`, parseError);
                        // Decide how to handle: skip update, return error? For now, skip.
                    }
                } else if (field === 'certifications' && typeof value === 'string') {
                    // Handle certifications if sent as a single string, split into array
                    // Adjust if frontend sends it differently (e.g., already as array parts)
                    foodItem[field] = value.split(',').map(cert => cert.trim()).filter(cert => cert); // Split, trim, remove empty
                    console.log(`[API] Processed certifications:`, foodItem[field]);
                } else {
                    foodItem[field] = value;
                }
            }
        }

        // Assign the potentially updated image URL
        foodItem.imageUri = newImageUrl;

        // --- Save Changes --- 
        console.log('[API] Attempting to save listing with updates:', foodItem.toObject()); // Log before save
        const updatedListing = await foodItem.save(); // Use foodItem found earlier
        console.log(`[API] Listing ${id} updated successfully.`);
        res.json(updatedListing);

    } catch (error) {
        console.error(`[API] Error updating listing ID ${id}:`, error);
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid listing ID format' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: `Validation failed: ${error.message}` });
        }
        res.status(500).json({ error: 'Server error while updating listing' });
    }
});

module.exports = router;
