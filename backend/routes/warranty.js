const express = require('express');
const Warranty = require('../models/warranty');

const router = express.Router();


const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
// Get all warranties
router.get('/', asyncHandler(async (req, res) => {
    const warranties = await Warranty.findAll();
    res.json(warranties);
}));

// Get a single warranty by ID
router.get('/:id', asyncHandler(async (req, res) => {
    const warranty = await Warranty.findByPk(req.params.id);
    if (!warranty) {
        return res.status(404).json({error: 'Warranty not found'});
    }
    res.json(warranty);
}));

// Create a new warranty
router.post('/', asyncHandler(async (req, res) => {
    const {name, duration, periods, description, status} = req.body;
    const warranty = await Warranty.create({name, duration, periods, description, status});
    res.status(201).json(warranty);
}));

// Update a warranty
router.put('/:id', asyncHandler(async (req, res) => {
    const {name, duration, periods, description, status} = req.body;
    const warranty = await Warranty.findByPk(req.params.id);
    if (!warranty) {
        return res.status(404).json({error: 'Warranty not found'});
    }

    warranty.name = name || warranty.name;
    warranty.duration = duration || warranty.duration;
    warranty.periods = periods || warranty.periods;
    warranty.description = description || warranty.description;
    warranty.status = status !== undefined ? status : warranty.status;

    await warranty.save();
    res.json(warranty);
}));

// Delete a warranty
router.delete('/:id', asyncHandler(async (req, res) => {
    const warranty = await Warranty.findByPk(req.params.id);
    if (!warranty) {
        return res.status(404).json({error: 'Warranty not found'});
    }
    await warranty.destroy();
    res.status(204).end();
}));

module.exports = router;
