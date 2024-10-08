const express = require('express');
const { Warranty } = require('../../models/associations');
const authenticateToken = require("../../middleware/auth");
const { ValidationError } = require('sequelize');

const router = express.Router();

// Utility function to handle async routes
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Validate warranty input
const validateWarrantyInput = (name, duration, periods, description, status) => {
    if (!name || typeof name !== 'string' || name.trim() === '') {
        throw new ValidationError('Valid name is required');
    }
    if (!duration || typeof duration !== 'string' || duration.trim() === '') {
        throw new ValidationError('Valid duration is required');
    }
    if (!periods || !Array.isArray(periods)) {
        throw new ValidationError('Periods must be an array');
    }
    if (!description || typeof description !== 'string' || description.trim() === '') {
        throw new ValidationError('Valid description is required');
    }
    if (status === undefined) {
        throw new ValidationError('Status is required');
    }
};

// Emit socket event to other clients
const emitToOthers = (req, event, data) => {
    const socketId = req.headers['x-socket-id'];
    if (req.io && typeof req.io.emit === 'function') {
        req.io.emit(event, data, { except: socketId });
    }
};

// Get all warranties
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    const warranties = await Warranty.findAll();
    if (!warranties || warranties.length === 0) {
        return res.status(404).json({ error: 'No warranties found' });
    }
    res.json(warranties);
}));

// Get a single warranty by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ error: 'Missing warranty ID' });
    }

    const warranty = await Warranty.findByPk(id);
    if (!warranty) {
        return res.status(404).json({ error: 'Warranty not found' });
    }
    res.json(warranty);
}));

// Create a new warranty
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    const { name, duration, periods, description, status } = req.body;
    validateWarrantyInput(name, duration, periods, description, status);

    try {
        const warranty = await Warranty.create({ name, duration, periods, description, status });
        res.status(201).json(warranty);
        emitToOthers(req, 'newWarranty', warranty);
    } catch (err) {
        console.error('Error creating warranty:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}));

// Update a warranty
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ error: 'Missing warranty ID' });
    }

    const warranty = await Warranty.findByPk(id);
    if (!warranty) {
        return res.status(404).json({ error: 'Warranty not found' });
    }

    const { name, duration, periods, description, status } = req.body;
    if (name) warranty.name = name;
    if (duration) warranty.duration = duration;
    if (periods) warranty.periods = periods;
    if (description) warranty.description = description;
    if (status !== undefined) warranty.status = status;

    await warranty.save();
    emitToOthers(req, 'updateWarranty', warranty);
    res.json(warranty);
}));

// Delete a warranty
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ error: 'Missing warranty ID' });
    }

    const warranty = await Warranty.findByPk(id);
    if (!warranty) {
        return res.status(404).json({ error: 'Warranty not found' });
    }
    await warranty.destroy();
    emitToOthers(req, 'deleteWarranty', id);
    res.status(204).end();
}));

module.exports = router;