const express = require('express');
const router = express.Router();
const  Unit  = require('../models/unit'); // Adjust the path as necessary

const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Create a unit
router.post('/', asyncHandler(async (req, res) => {
    const { name, abbreviation, description } = req.body;

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
    const unit = await Unit.findByPk(req.params.id);
    if (!unit) return res.status(404).json({ error: 'Unit not found' });
    res.status(200).json(unit);
}));

// Update a unit
router.put('/:id', asyncHandler(async (req, res) => {
    const { name, abbreviation, description } = req.body;
    const unit = await Unit.findByPk(req.params.id);
    if (!unit) return res.status(404).json({ error: 'Unit not found' });

    unit.name = name || unit.name;
    unit.abbreviation = abbreviation || unit.abbreviation;
    unit.description = description || unit.description;

    await unit.save();
    res.status(200).json(unit);
    req.io.emit('updateUnit', unit);
}));

// Delete a unit
router.delete('/:id', asyncHandler(async (req, res) => {
    const id = req.params.id
    const unit = await Unit.findByPk(id);
    if (!unit) return res.status(404).json({ error: 'Unit not found' });

    await unit.destroy();
    res.status(204).send();
    req.io.emit('deleteUnit', id);
}));

module.exports = router;
