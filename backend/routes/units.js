const express = require('express');
const router = express.Router();
const  Unit  = require('../models/unit'); // Adjust the path as necessary

const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Create a unit
router.post('/', asyncHandler(async (req, res) => {
    const { name, abbreviation, description } = req.body;

    if (!name || !abbreviation || !description) {
        return res.status(400).json({ error: 'Name, abbreviation, and description are required' });
    }

    try {
        const unit = await Unit.create({ name, abbreviation, description });
        res.status(201).json(unit);
        req.io.emit('newUnit', unit);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}));

// Get all units
router.get('/', asyncHandler(async (req, res) => {
    const units = await Unit.findAll();
    res.status(200).json(units);
}));

// Get a single unit by ID
router.get('/:id', asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (isNaN(parseInt(id))) {
        return res.status(400).json({ error: 'Invalid unit ID' });
    }

    const unit = await Unit.findByPk(id);
    if (!unit) return res.status(404).json({ error: 'Unit not found' });
    res.status(200).json(unit);
}));

// Update a unit
router.put('/:id', asyncHandler(async (req, res) => {
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

// Delete a unit
router.delete('/:id', asyncHandler(async (req, res) => {
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