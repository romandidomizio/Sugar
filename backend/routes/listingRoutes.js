// backend/routes/listingRoutes.js
const express = require('express');
const router = express.Router();
const FoodItem = require('../models/FoodItem'); // Assuming FoodItem model is in ../models/FoodItem

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
        res.status(200).json(listing);

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
