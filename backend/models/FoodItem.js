const mongoose = require('mongoose');

const FoodItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  producer: {
    type: String,
    required: true
  },
//  price: {
//    type: String,
//    required: true
//  },
price: {
    type: Number,
    required: true,
    min: 0 // Optional: ensure price isn't negative
},
  description: {
    type: String,
    required: true
  },
  imageUri: {
    type: String,
    required: true
  },
  origin: {
    type: String,
    required: true
  },
  certifications: {
    type: [String],
    default: []
  },
  expiryDate: {
    type: Date,
    required: true
  },
  contactInfo: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FoodItem', FoodItemSchema);
