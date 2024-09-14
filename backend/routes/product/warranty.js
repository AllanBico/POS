const express = require('express');
const Warranty = require('../../models/product/warranty');
const authenticateToken = require("../../middleware/auth");

const router = express.Router();

const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Get all warranties
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    const warranties = await Warranty.findAll();
    if (!warranties) {
        return res.status(404).json({error: 'No warranties found'});
    }
    res.json(warranties);
}));

// Get a single warranty by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({error: 'Missing warranty ID'});
    }

    const warranty = await Warranty.findByPk(id);
    if (!warranty) {
        return res.status(404).json({error: 'Warranty not found'});
    }
    res.json(warranty);
}));

// Create a new warranty
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    const {name, duration, periods, description, status} = req.body;
    if (!name || !duration || !periods || !description || status === undefined) {
        return res.status(400).json({error: 'Missing required fields'});
    }

    const warranty = await Warranty.create({name, duration, periods, description, status});
    if (!warranty) {
        return res.status(500).json({error: 'Failed to create warranty'});
    }
    res.status(201).json(warranty);
    req.io.emit('newWarranty', warranty);
}));

// Update a warranty
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({error: 'Missing warranty ID'});
    }

    const {name, duration, periods, description, status} = req.body;
    const warranty = await Warranty.findByPk(id);
    if (!warranty) {
        return res.status(404).json({error: 'Warranty not found'});
    }

    if (name) warranty.name = name;
    if (duration) warranty.duration = duration;
    if (periods) warranty.periods = periods;
    if (description) warranty.description = description;
    if (status !== undefined) warranty.status = status;

    await warranty.save();
    const updatedWarranty = await Warranty.findByPk(id);
    if (!updatedWarranty) {
        return res.status(500).json({error: 'Failed to update warranty'});
    }
    res.json(updatedWarranty);
    req.io.emit('updateWarranty', updatedWarranty);
}));

// Delete a warranty
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({error: 'Missing warranty ID'});
    }

    const warranty = await Warranty.findByPk(id);
    if (!warranty) {
        return res.status(404).json({error: 'Warranty not found'});
    }
    await warranty.destroy();
    res.status(204).end();
    req.io.emit('deleteWarranty', id);
}));

module.exports = router;