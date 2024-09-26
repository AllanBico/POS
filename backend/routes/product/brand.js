const express = require('express');
const { Brand } = require('../../models/associations');
const authenticateToken = require('../../middleware/auth');

const router = express.Router();

// Utility function to handle async routes
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Validate brand input
const validateBrandInput = (name, description) => {
    if (!name || typeof name !== 'string' || name.trim() === '') {
        throw new Error('Name is required and must be a non-empty string');
    }
    if (!description || typeof description !== 'string' || description.trim() === '') {
        throw new Error('Description is required and must be a non-empty string');
    }
};

// Create a new brand
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    validateBrandInput(name, description);

    const existingBrand = await Brand.findOne({ where: { name: name.trim() } });
    if (existingBrand) {
        return res.status(409).json({ error: 'Brand with this name already exists' });
    }

    const brand = await Brand.create({ name: name.trim(), description: description.trim() });
    res.status(201).json(brand);
    if (req.io && typeof req.io.emit === 'function') {
        req.io.emit('newBrand', brand);
    }
}));

// Get all brands
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    const brands = await Brand.findAll();
    res.status(200).json(brands);
}));

// Get a single brand by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'Invalid Brand ID' });
    }

    const brand = await Brand.findByPk(id);
    if (!brand) {
        return res.status(404).json({ error: 'Brand not found' });
    }
    res.status(200).json(brand);
}));

// Update a brand
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'Invalid ID' });
    }

    const { name, description } = req.body;
    validateBrandInput(name, description);

    const brand = await Brand.findByPk(id);
    if (!brand) {
        return res.status(404).json({ error: 'Brand not found' });
    }

    const { Op } = require('sequelize');
    const existingBrand = await Brand.findOne({
        where: {
            [Op.and]: [
                { id: { [Op.not]: id } },
                { name }
            ]
        }
    });
    if (existingBrand) {
        return res.status(409).json({ error: 'Another brand with this name already exists' });
    }

    brand.name = name.trim();
    brand.description = description.trim();
    await brand.save();

    const updatedBrand = await Brand.findByPk(id);
    res.status(200).json(updatedBrand);
    const socketId = req.headers['x-socket-id'];
    if (req.io && typeof req.io.emit === 'function') {
        req.io.emit('updateBrand', updatedBrand, { except: socketId });
    }
}));

// Delete a brand (soft delete)
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'Invalid ID' });
    }

    const brand = await Brand.findByPk(id);
    if (!brand) {
        return res.status(404).json({ error: 'Brand not found' });
    }

    await brand.destroy();
    res.status(200).json({ message: 'Brand deleted successfully' });
    if (req.io && typeof req.io.emit === 'function') {
        req.io.emit('deleteBrand', id);
    }
}));

// Error handling middleware
router.use((err, req, res, next) => {
    console.error(err.stack); // Log the stack trace for debugging
    const status = err.status || 500;
    const errorResponse = {
        error: {
            message: err.message || 'An unexpected error occurred',
            status: status,
            name: err.name || 'InternalServerError'
        }
    };
    res.status(status).json(errorResponse);
});

module.exports = router;