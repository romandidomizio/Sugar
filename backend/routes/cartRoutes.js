// backend/routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const FoodItem = require('../models/FoodItem');
const authMiddleware = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// Get user's cart
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    // Find cart for this user or create one if it doesn't exist
    let cart = await Cart.findOne({ user: userId }).populate('items.foodItem');

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
      await cart.save();
    }

    res.json(cart);
  } catch (error) {
    console.error('Failed to fetch cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add item to cart
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;
    const userId = req.user._id || req.user.id;

    // Validate itemId
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ error: 'Invalid item ID' });
    }

    // Verify that the food item exists
    const foodItem = await FoodItem.findById(itemId);
    if (!foodItem) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    // Find user's cart or create one
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.foodItem.toString() === itemId
    );

    if (existingItemIndex !== -1) {
      // If item exists, update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // If item doesn't exist, add it
      cart.items.push({ foodItem: itemId, quantity });
    }

    cart.updatedAt = Date.now();
    await cart.save();

    // Populate the food items details before sending response
    const populatedCart = await Cart.findById(cart._id).populate('items.foodItem');

    res.status(201).json(populatedCart);
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update item quantity in cart
router.put('/update', authMiddleware, async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const userId = req.user._id || req.user.id;

    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be positive' });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      item => item.foodItem.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    cart.items[itemIndex].quantity = quantity;
    cart.updatedAt = Date.now();

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.foodItem');
    res.json(populatedCart);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// Remove item from cart
router.delete('/remove/:itemId', authMiddleware, async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user._id || req.user.id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      item => item.foodItem.toString() !== itemId
    );

    cart.updatedAt = Date.now();
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.foodItem');
    res.json(populatedCart);
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// Clear cart
router.delete('/clear', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router;
//claude v1
//const express = require('express');
//const router = express.Router();
//const Cart = require('../models/Cart');
//const FoodItem = require('../models/FoodItem');
//const Order = require('../models/Order');
//const authMiddleware = require('../middleware/authMiddleware');
//const mongoose = require('mongoose');
//
//// Use authentication middleware for all cart routes
//router.use(authMiddleware);
//
//// Get current user's cart
//router.get('/', async (req, res) => {
//  try {
//    const userId = req.user.userId || req.user._id;
//
//    let cart = await Cart.findOne({ user: userId }).populate('items.foodItemId');
//
//    if (!cart) {
//      cart = new Cart({ user: userId, items: [] });
//      await cart.save();
//    }
//
//    res.json(cart);
//  } catch (error) {
//    console.error('Error getting cart:', error);
//    res.status(500).json({ error: 'Failed to get cart' });
//  }
//});
//
//// Add item to cart
//router.post('/items', async (req, res) => {
//  try {
//    const { foodItemId, quantity = 1 } = req.body;
//    const userId = req.user.userId || req.user._id;
//
//    // Validate food item exists
//    const foodItem = await FoodItem.findById(foodItemId);
//    if (!foodItem) {
//      return res.status(404).json({ error: 'Food item not found' });
//    }
//
//    // Find or create user's cart
//    let cart = await Cart.findOne({ user: userId });
//    if (!cart) {
//      cart = new Cart({ user: userId, items: [] });
//    }
//
//    // Check if item already in cart
//    const itemIndex = cart.items.findIndex(
//      item => item.foodItemId.toString() === foodItemId
//    );
//
//    if (itemIndex > -1) {
//      // Item exists, update quantity
//      cart.items[itemIndex].quantity += quantity;
//    } else {
//      // Add new item
//      cart.items.push({ foodItemId, quantity });
//    }
//
//    cart.updatedAt = Date.now();
//    await cart.save();
//
//    // Return populated cart
//    const populatedCart = await Cart.findById(cart._id).populate('items.foodItemId');
//    res.status(201).json(populatedCart);
//  } catch (error) {
//    console.error('Error adding to cart:', error);
//    res.status(500).json({ error: 'Failed to add item to cart' });
//  }
//});
//
//// Update cart item quantity
//router.put('/items/:foodItemId', async (req, res) => {
//  try {
//    const { foodItemId } = req.params;
//    const { quantity } = req.body;
//    const userId = req.user.userId || req.user._id;
//
//    if (!quantity || quantity < 1) {
//      return res.status(400).json({ error: 'Quantity must be at least 1' });
//    }
//
//    const cart = await Cart.findOne({ user: userId });
//    if (!cart) {
//      return res.status(404).json({ error: 'Cart not found' });
//    }
//
//    const itemIndex = cart.items.findIndex(
//      item => item.foodItemId.toString() === foodItemId
//    );
//
//    if (itemIndex === -1) {
//      return res.status(404).json({ error: 'Item not found in cart' });
//    }
//
//    cart.items[itemIndex].quantity = quantity;
//    cart.updatedAt = Date.now();
//    await cart.save();
//
//    const populatedCart = await Cart.findById(cart._id).populate('items.foodItemId');
//    res.json(populatedCart);
//  } catch (error) {
//    console.error('Error updating cart item:', error);
//    res.status(500).json({ error: 'Failed to update cart item' });
//  }
//});
//
//// Remove item from cart
//router.delete('/items/:foodItemId', async (req, res) => {
//  try {
//    const { foodItemId } = req.params;
//    const userId = req.user.userId || req.user._id;
//
//    const cart = await Cart.findOne({ user: userId });
//    if (!cart) {
//      return res.status(404).json({ error: 'Cart not found' });
//    }
//
//    cart.items = cart.items.filter(
//      item => item.foodItemId.toString() !== foodItemId
//    );
//
//    cart.updatedAt = Date.now();
//    await cart.save();
//
//    const populatedCart = await Cart.findById(cart._id).populate('items.foodItemId');
//    res.json(populatedCart);
//  } catch (error) {
//    console.error('Error removing cart item:', error);
//    res.status(500).json({ error: 'Failed to remove cart item' });
//  }
//});
//
//// Clear cart
//router.delete('/', async (req, res) => {
//  try {
//    const userId = req.user.userId || req.user._id;
//
//    const cart = await Cart.findOne({ user: userId });
//    if (!cart) {
//      return res.status(404).json({ error: 'Cart not found' });
//    }
//
//    cart.items = [];
//    cart.updatedAt = Date.now();
//    await cart.save();
//
//    res.json({ message: 'Cart cleared successfully' });
//  } catch (error) {
//    console.error('Error clearing cart:', error);
//    res.status(500).json({ error: 'Failed to clear cart' });
//  }
//});
//
//// Checkout (create order from cart)
//router.post('/checkout', async (req, res) => {
//  try {
//    const userId = req.user.userId || req.user._id;
//
//    // Find user's cart
//    const cart = await Cart.findOne({ user: userId }).populate('items.foodItemId');
//    if (!cart || cart.items.length === 0) {
//      return res.status(400).json({ error: 'Cart is empty' });
//    }
//
//    // Calculate total amount
//    let totalAmount = 0;
//    const orderItems = cart.items.map(item => {
//      const foodItem = item.foodItemId;
//
//      // Extract numeric price value (assuming format like "$12.99")
//      const priceMatch = foodItem.price.match(/\$([0-9.]+)/);
//      const priceValue = priceMatch ? parseFloat(priceMatch[1]) : 0;
//
//      totalAmount += priceValue * item.quantity;
//
//      return {
//        foodItem: foodItem._id,
//        title: foodItem.title,
//        producer: foodItem.producer,
//        price: foodItem.price,
//        quantity: item.quantity
//      };
//    });
//
//    // Create new order
//    const order = new Order({
//      user: userId,
//      items: orderItems,
//      totalAmount,
//      status: 'completed'
//    });
//
//    await order.save();
//
//    // Clear the cart
//    cart.items = [];
//    cart.updatedAt = Date.now();
//    await cart.save();
//
//    res.status(201).json({
//      message: 'Order created successfully',
//      order
//    });
//  } catch (error) {
//    console.error('Error during checkout:', error);
//    res.status(500).json({ error: 'Checkout failed' });
//  }
//});
//
//// Get user's order history
//router.get('/orders', async (req, res) => {
//  try {
//    const userId = req.user.userId || req.user._id;
//
//    const orders = await Order.find({ user: userId })
//      .sort({ createdAt: -1 }) // Most recent first
//      .populate('items.foodItem');
//
//    res.json(orders);
//  } catch (error) {
//    console.error('Error fetching orders:', error);
//    res.status(500).json({ error: 'Failed to fetch orders' });
//  }
//});
//
//module.exports = router;
