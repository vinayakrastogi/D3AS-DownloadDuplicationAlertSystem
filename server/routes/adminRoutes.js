const express = require('express');
const router = express.Router();
const Object = require('../models/Object');

// Get all objects
router.get('/objects', async (req, res) => {
  try {
    const objects = await Object.find().sort({ createdAt: -1 });
    res.json(objects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single object
router.get('/objects/:id', async (req, res) => {
  try {
    const object = await Object.findById(req.params.id);
    if (!object) {
      return res.status(404).json({ error: 'Object not found' });
    }
    res.json(object);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create object
router.post('/objects', async (req, res) => {
  try {
    const { name, size, logo } = req.body;
    
    if (!name || size === undefined) {
      return res.status(400).json({ error: 'Name and size are required' });
    }

    const object = new Object({
      name,
      size: parseFloat(size),
      logo: logo || ''
    });

    await object.save();
    res.status(201).json(object);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update object
router.put('/objects/:id', async (req, res) => {
  try {
    const { name, size, logo } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (size !== undefined) updateData.size = parseFloat(size);
    if (logo !== undefined) updateData.logo = logo;

    const object = await Object.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!object) {
      return res.status(404).json({ error: 'Object not found' });
    }

    res.json(object);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete object
router.delete('/objects/:id', async (req, res) => {
  try {
    const object = await Object.findByIdAndDelete(req.params.id);
    if (!object) {
      return res.status(404).json({ error: 'Object not found' });
    }
    res.json({ message: 'Object deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
