// backend/models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      foodItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoodItem',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      price: {
        type: String,
        required: true
      }
    }
  ],
  totalAmount: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', OrderSchema);

//claude v1
//const mongoose = require('mongoose');
//
//const OrderSchema = new mongoose.Schema({
//  user: {
//    type: mongoose.Schema.Types.ObjectId,
//    ref: 'User',
//    required: true
//  },
//  items: [{
//    foodItem: {
//      type: mongoose.Schema.Types.ObjectId,
//      ref: 'FoodItem',
//      required: true
//    },
//    title: String,
//    producer: String,
//    price: String,
//    quantity: {
//      type: Number,
//      required: true,
//      min: 1
//    }
//  }],
//  totalAmount: {
//    type: Number,
//    required: true
//  },
//  status: {
//    type: String,
//    enum: ['pending', 'completed', 'cancelled'],
//    default: 'pending'
//  },
//  createdAt: {
//    type: Date,
//    default: Date.now
//  }
//});
//
//module.exports = mongoose.model('Order', OrderSchema);
