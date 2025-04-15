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
    type: Number, // AI: Changed type to Number for proper validation
    required: [true, 'Price is required.'],
    min: [0, 'Price cannot be negative.'] // AI: Allow 0, prevent negative values
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
  quantity: {
    type: Number,
    // Required only if unitType is 'unit'
    required: function() { return this.unitType === 'unit'; },
    // Custom validation array
    validate: [
      {
        // Validator 1: Ensure it's an integer IF a value is provided.
        // Allows null/undefined when not required (i.e., unitType is 'size').
        validator: function(v) {
          if (this.unitType === 'size' && (v === null || v === undefined)) {
            return true; // Allow null/undefined for 'size' type
          }
          return Number.isInteger(v); // Check if integer otherwise
        },
        message: props => `{VALUE} is not an integer value for quantity.`
      },
      {
        // Validator 2: Ensure quantity is >= 1 ONLY if unitType is 'unit'.
        validator: function(v) {
          if (this.unitType !== 'unit') {
            return true; // Skip this check if not 'unit' type
          }
          // For 'unit' type, value must be an integer >= 1
          return v !== null && v !== undefined && Number.isInteger(v) && v >= 1;
        },
        message: props => `Quantity must be at least 1 if pricing per unit (received ${props.value}).`
      }
    ]
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
