const mongoose = require('mongoose');

// Define a schema for GeoJSON Point
const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true
  }
}, { _id: false }); // Prevent Mongoose from creating a separate _id for the location subdocument

const FoodItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  producer: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
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
  contactMethod: { 
    type: String,
    required: false 
  },
  unitType: { // Determines how the item is measured and priced
    type: String,
    required: [true, 'Please specify if the price is per unit or per size/weight.'],
    enum: { 
      values: ['unit', 'size'],
      message: 'Unit type must be either \'unit\' or \'size\'.'
    }
  },
  quantity: { // Number of individual units available
    type: Number,
    required: function() { return this.unitType === 'unit'; }, // Required only if unitType is 'unit'
    min: [1, 'Quantity must be at least 1 if pricing per unit.'],
    validate: { // Ensure it's an integer if provided
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value for quantity.'
    }
  },
  sizeMeasurement: { // Specific size/weight measurement (e.g., '5 lbs', 'Gallon')
    type: String,
    required: function() { return this.unitType === 'size'; }, // Required only if unitType is 'size'
    trim: true, // Remove whitespace
    validate: { // Ensure it's not empty if required
        validator: function(v) { return !(this.unitType === 'size' && !v); },
        message: 'Size/weight measurement description is required if pricing per size.'
      }
  },
  shareLocation: { 
    type: Boolean, 
    default: false 
  },
  location: { 
    type: pointSchema, 
    required: false 
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Add a reference to the User model
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assumes your user model is named 'User'
    required: true,
    index: true // Add an index for efficient querying by user
  }
});

// Create a 2dsphere index on the location field for geospatial queries
FoodItemSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('FoodItem', FoodItemSchema);
