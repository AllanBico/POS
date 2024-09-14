const express = require('express');
const router = express.Router();
const Unit = require('../../models/product/unit');
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
const authenticateToken = require('../../middleware/auth');

// Create a unit (requires authentication)
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    const { name, abbreviation, description } = req.body;
    const createdBy = req.user.id;
    if (!name || !abbreviation || !description) {
        return res.status(400).json({ error: 'Name, abbreviation, and description are required' });
    }

    try {
        const unit = await Unit.create({ name, abbreviation, description,createdBy });
        res.status(201).json(unit);
        req.io.emit('newUnit', unit);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}));

// Get all units (requires authentication)
router.get('/',  asyncHandler(async (req, res) => {
    const units = await Unit.findAll();
    console.log("req.user.id",req.user.id);
    res.status(200).json(units);
}));

// Get a single unit by ID (requires authentication)
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (isNaN(parseInt(id))) {
        return res.status(400).json({ error: 'Invalid unit ID' });
    }

    const unit = await Unit.findByPk(id);
    if (!unit) return res.status(404).json({ error: 'Unit not found' });
    res.status(200).json(unit);
}));

// Update a unit (requires authentication)
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const { name, abbreviation, description } = req.body;
    const id = req.params.id;
    if (isNaN(parseInt(id))) {
        return res.status(400).json({ error: 'Invalid unit ID' });
    }

    const unit = await Unit.findByPk(id);
    if (!unit) return res.status(404).json({ error: 'Unit not found' });

    if (name) unit.name = name;
    if (abbreviation) unit.abbreviation = abbreviation;
    if (description) unit.description = description;

    await unit.save();
    res.status(200).json(unit);
    req.io.emit('updateUnit', unit);
}));

// Delete a unit (requires authentication)
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (isNaN(parseInt(id))) {
        return res.status(400).json({ error: 'Invalid unit ID' });
    }

    const unit = await Unit.findByPk(id);
    if (!unit) return res.status(404).json({ error: 'Unit not found' });

    await unit.destroy();
    res.status(204).send();
    req.io.emit('deleteUnit', id);
}));

module.exports = router;