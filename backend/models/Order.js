// backend/models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodItem',
    required: true
  },
  itemName: { // Store name at time of purchase
    type: String,
    required: true
  },
  price: { // Store price *as a number* at time of purchase
    type: Number,
    required: true,
    min: 0
  },
  sellerId: { // Store seller ID for easy reference
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
  // Optional: Add quantity if you decide to track how many the user *requested*
  // quantityRequested: {
  //   type: Number,
  //   required: true,
  //   min: 1,
  //   default: 1
  // }
}, { _id: false }); // No separate _id for subdocuments needed

const OrderSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Index for fast lookup of user's orders
  },
  items: [orderItemSchema], // Array of items included in this order
  orderDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending Coordination', 'Completed', 'Cancelled'], // Example statuses
    default: 'Pending Coordination'
  },
  totalPrice: { // Calculated total price for convenience
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Order', OrderSchema);