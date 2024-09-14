const express = require('express');
const {  Attribute } = require('../../models/associations');
const authenticateToken = require('../../middleware/auth');

const router = express.Router();
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Create Attribute
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    const attribute = await Attribute.create({ name, description });
    res.status(201).json(attribute);
    req.io.emit('newAttribute', attribute);
}));

// Get All Attributes
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    const attributes = await Attribute.findAll();
    res.json(attributes);
}));

// Get Single Attribute by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const attribute = await Attribute.findByPk(req.params.id);
    if (!attribute) {
        return res.status(404).json({ error: 'Attribute not found' });
    }
    res.json(attribute);
}));

// Update Attribute by ID
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const attribute = await Attribute.findByPk(req.params.id);
    if (!attribute) {
        return res.status(404).json({ error: 'Attribute not found' });
    }

    if (name) attribute.name = name;
    if (description) attribute.description = description;

    await attribute.save();
    const updatedAttribute = await Attribute.findByPk(req.params.id);
    res.json(updatedAttribute);
    req.io.emit('updateAttribute', updatedAttribute);
}));

// Delete Attribute by ID
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const id = req.params.id
    const attribute = await Attribute.findByPk(id);
    if (!attribute) {
        return res.status(404).json({ error: 'Attribute not found' });
    }

    await attribute.destroy();
    res.status(204).end();
    req.io.emit('deleteAttribute', id);
}));

module.exports = router;