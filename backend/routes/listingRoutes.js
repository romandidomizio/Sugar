// backend/routes/listingRoutes.js
const express = require('express');
const router = express.Router();
const FoodItem = require('../models/FoodItem'); // Assuming FoodItem model is in ../models/FoodItem

// Ensure SERVER_URL is available from .env
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000'; // Default fallback

// Helper function to add full path to imageUri
const addFullPathToImageUri = (item) => {
  // Ensure item is a plain object for modification
  const plainItem = item.toObject ? item.toObject() : item;
  if (plainItem.imageUri && !plainItem.imageUri.startsWith('http')) {
    // Ensure imageUri is treated as relative path from root
    const relativePath = plainItem.imageUri.startsWith('/') ? plainItem.imageUri : `/uploads/${plainItem.imageUri}`;
    // Construct the full URL
    plainItem.imageUri = `${SERVER_URL}${relativePath.startsWith('/uploads') ? relativePath : '/uploads' + relativePath}`;
  }
  return plainItem; // Return modified plain object
};


// --- GET all listings ---
// Path: /api/listings
// Access: Public (for marketplace display)
router.get('/', async (req, res) => {
    console.log('[API] GET /listings (all) request received.');
    try {
        // Fetch all items and sort by createdAt descending (newest first)
        const listings = await FoodItem.find({}).sort({ createdAt: -1 });
        
        console.log(`[API] Found ${listings.length} listings.`);
        
        // Transform image URIs before sending
        const listingsWithFullImagePaths = listings.map(addFullPathToImageUri);
        
        res.status(200).json(listingsWithFullImagePaths); // Send transformed listings
        
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
        
        // Transform image URI before sending
        const listingWithFullImagePath = addFullPathToImageUri(listing);

        res.status(200).json(listingWithFullImagePath); // Send transformed listing

    } catch (error) {
        console.error(`[API] Error fetching listing ID ${req.params.id}:`, error);
        // Check for CastError (invalid ID format)
        if (error.name === 'CastError') {
             return res.status(400).json({ error: 'Invalid listing ID format' });
        }
        res.status(500).json({ error: 'Server error while fetching listing' });
    }
});

module.exports = router;
