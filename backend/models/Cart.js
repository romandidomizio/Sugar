// backend/models/Cart.js
const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
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
      }
    }
  ],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Cart', CartSchema);
//claude v1
//const mongoose = require('mongoose');
//
//const CartSchema = new mongoose.Schema({
//  user: {
//    type: mongoose.Schema.Types.ObjectId,
//    ref: 'User',
//    required: true
//  },
//  items: [{
//    foodItemId: {
//      type: mongoose.Schema.Types.ObjectId,
//      ref: 'FoodItem',
//      required: true
//    },
//    quantity: {
//      type: Number,
//      required: true,
//      min: 1
//    }
//  }],
//  updatedAt: {
//    type: Date,
//    default: Date.now
//  }
//});
//
//module.exports = mongoose.model('Cart', CartSchema);
