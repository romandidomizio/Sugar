const express = require('express');
const router = express.Router();
const FoodItem = require('../models/FoodItem');

// GET /marketplace
router.get('/marketplace', async (req, res) => {
  try {
    const items = await FoodItem.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch food items' });
  }
});

// POST /user/listings
router.post('/user/listings', async (req, res) => {
  const { title, producer, price, description, imageUri, origin, certifications, expiryDate, contactInfo } = req.body;
  const newItem = new FoodItem({ title, producer, price, description, imageUri, origin, certifications, expiryDate, contactInfo });
  try {
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add food item' });
  }
});

// PUT /user/listings/:id
router.put('/user/listings/:id', async (req, res) => {
  try {
    const updatedItem = await FoodItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedItem) {
      return res.status(404).json({ error: 'Food item not found' });
    }
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update food item' });
  }
});

// DELETE /user/listings/:id
router.delete('/user/listings/:id', async (req, res) => {
  try {
    const deletedItem = await FoodItem.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ error: 'Food item not found' });
    }
    res.json({ message: 'Food item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete food item' });
  }
});

module.exports = router;
