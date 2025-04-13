// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const authMiddleware = require('../middleware/authMiddleware');

// Get user's order history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const orders = await Order.find({ user: userId })
      .populate('items.foodItem')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).json({ error: 'Failed to fetch order history' });
  }
});

// Create a new order from cart
router.post('/checkout', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { totalAmount } = req.body;

    // Find user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.foodItem');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Create order items from cart items
    const orderItems = cart.items.map(item => ({
      foodItem: item.foodItem._id,
      quantity: item.quantity,
      price: item.foodItem.price
    }));

    // Create new order
    const newOrder = new Order({
      user: userId,
      items: orderItems,
      totalAmount,
      status: 'completed'
    });

    await newOrder.save();

    // Clear the cart after successful order
    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();

    // Return the populated order
    const populatedOrder = await Order.findById(newOrder._id).populate('items.foodItem');

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get specific order details
router.get('/:orderId', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id || req.user.id;

    const order = await Order.findOne({
      _id: orderId,
      user: userId
    }).populate('items.foodItem');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

module.exports = router;