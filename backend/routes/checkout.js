// is this claude or chat?
//// routes/checkout.js
//const express = require('express');
//const router = express.Router();
//const Cart = require('../models/Cart');
//const Order = require('../models/Order');
//const authMiddleware = require('../middleware/authMiddleware'); // Authentication middleware
//
//// Checkout and create an order
//router.post('/', authMiddleware, async (req, res) => {
//  const { shippingAddress } = req.body;
//
//  try {
//    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
//    if (!cart || cart.items.length === 0) {
//      return res.status(400).json({ message: 'Your cart is empty' });
//    }
//
//    const totalAmount = cart.items.reduce(
//      (total, item) => total + item.product.price * item.quantity,
//      0
//    );
//
//    const order = new Order({
//      user: req.user.id,
//      items: cart.items.map(item => ({
//        product: item.product,
//        quantity: item.quantity,
//        price: item.product.price,
//      })),
//      totalAmount,
//      shippingAddress,
//    });
//
//    await order.save();
//
//    // Clear the user's cart after checkout
//    cart.items = [];
//    await cart.save();
//
//    res.status(201).json(order);
//  } catch (err) {
//    console.error(err);
//    res.status(500).json({ message: 'Server error' });
//  }
//});
//
//module.exports = router;
