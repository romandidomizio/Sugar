// backend/routes/orderRoutes.js
const express = require('express');
const Order = require('../models/Order');
const FoodItem = require('../models/FoodItem'); // Need this to fetch item details
const { validationResult, body } = require('express-validator'); // For input validation

const router = express.Router();

// --- Validation Middleware for Checkout ---
const validateCheckout = [
  body('cartItems').isArray({ min: 1 }).withMessage('Cart items must be a non-empty array.'),
  body('cartItems.*.itemId').isMongoId().withMessage('Invalid Item ID in cart.')
  // Optional: Add validation for quantity if you implement quantityRequested
  // body('cartItems.*.quantityRequested').isInt({ min: 1 }).withMessage('Invalid quantity requested.')
];

// --- Route: POST /api/orders/checkout ---
// @desc   Create a new order from cart items
// @access Private (requires authMiddleware)
router.post('/checkout', validateCheckout, async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { cartItems } = req.body; // e.g., [{ itemId: "...", quantityRequested: 1 }, ...]
  // ***** CORRECTED LINE BELOW *****
  const buyerId = req.user.userId; // Get buyer's ID from JWT payload via authMiddleware

  // Check if buyerId was actually retrieved (basic sanity check)
  if (!buyerId) {
      console.error('[Checkout] Error: buyerId is missing from req.user after authMiddleware.');
      return res.status(401).json({ message: 'Authentication error: User ID not found.' });
  }


  try {
    const orderItemsDetails = [];
    let calculatedTotalPrice = 0;
    const sellerIds = new Set(); // Use a Set to automatically handle unique IDs

    // 1. Fetch details for each item and validate
    for (const cartItem of cartItems) {
      const foodItem = await FoodItem.findById(cartItem.itemId).populate('userId', 'username'); // Fetch item + seller username

      if (!foodItem) {
        return res.status(404).json({ message: `Food item with ID ${cartItem.itemId} not found.` });
      }

      // *** Parse the price string to a number ***
      let priceAsNumber = parseFloat(foodItem.price); // Use let since it might be reassigned
      if (isNaN(priceAsNumber)) {
           console.warn(`[Checkout] Item ${foodItem._id} ('${foodItem.title}') has non-numeric price string: "${foodItem.price}". Treating as 0.`);
           priceAsNumber = 0; // Treat non-numeric price as 0
      }

      // Optional: Handle quantity requested per item line if your cart supports it
      const quantityRequested = cartItem.quantityRequested || 1; // Default to 1 if not provided

      orderItemsDetails.push({
        itemId: foodItem._id,
        itemName: foodItem.title,
        price: priceAsNumber, // Use the parsed number
        sellerId: foodItem.userId._id, // Get the ObjectId of the seller
        // quantityRequested: quantityRequested // Uncomment if tracking requested quantity
      });

      calculatedTotalPrice += priceAsNumber * quantityRequested; // Adjust if using quantityRequested
      sellerIds.add(foodItem.userId._id.toString()); // Add seller ID string to the set
    }

    // 2. Create the Order document
    const newOrder = new Order({
      buyerId: buyerId,
      items: orderItemsDetails,
      totalPrice: calculatedTotalPrice,
      status: 'Pending Coordination'
      // timestamps will be added automatically
    });

    // 3. Save the order
    const savedOrder = await newOrder.save();
    console.log(`[Checkout] Order ${savedOrder._id} created successfully for buyer ${buyerId}.`);


    // 4. Send success response
    res.status(201).json({
      success: true,
      message: 'Order placed successfully. Please coordinate with the seller(s).',
      orderId: savedOrder._id,
      sellerIds: Array.from(sellerIds) // Convert Set back to array for JSON response
    });

  } catch (error) {
    console.error('[Checkout] Error during checkout process:', error);
    res.status(500).json({ message: 'Server error during checkout process.' });
  }
});

// --- Route: GET /api/orders/my-orders ---
// @desc   Get orders placed by the logged-in user
// @access Private (requires authMiddleware)
router.get('/my-orders', async (req, res) => {
  // ***** CORRECTED LINE BELOW *****
  const buyerId = req.user.userId; // Get buyer's ID from JWT payload via authMiddleware

  // Check if buyerId was actually retrieved
   if (!buyerId) {
      console.error('[My Orders] Error: buyerId is missing from req.user after authMiddleware.');
      return res.status(401).json({ message: 'Authentication error: User ID not found.' });
  }

  try {
    const orders = await Order.find({ buyerId: buyerId })
                              .sort({ orderDate: -1 }) // Sort by newest first
                              .populate('items.sellerId', 'username name'); // Optionally populate seller info for display

    res.json(orders);

  } catch (error) {
    console.error('[My Orders] Error fetching user orders:', error);
    res.status(500).json({ message: 'Server error fetching orders.' });
  }
});

module.exports = router;