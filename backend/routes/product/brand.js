const express = require('express');
const { Brand } = require('../../models/associations');
const authenticateToken = require('../../middleware/auth');

const router = express.Router();

// Utility function to handle async routes
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Validate brand input
const validateBrandInput = (name, description) => {
    if (!name || !description) {
        const error = new Error('Name and description are required');
        error.status = 400;
        throw error;
    }
};

// Create a new brand
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    validateBrandInput(name, description);

    const brand = await Brand.create({ name, description });
    res.status(201).json(brand);
    req.io.emit('newBrand', brand);
}));

// Get all brands
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    const brands = await Brand.findAll();
    res.status(200).json(brands);
}));

// Get a single brand by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
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
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
    }

    const { name, description } = req.body;
    validateBrandInput(name, description);

    const brand = await Brand.findByPk(id);
    if (!brand) {
        return res.status(404).json({ error: 'Brand not found' });
    }

    brand.name = name;
    brand.description = description;
    await brand.save();

    const updatedBrand = await Brand.findByPk(id);
    res.status(200).json(updatedBrand);
    const socketId = req.headers['x-socket-id'];
    console.log('Socket ID:', socketId);
    req.io.emit('updateBrand', updatedBrand, { except: socketId });
}));

// Delete a brand (soft delete)
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
    }

    const brand = await Brand.findByPk(id);
    if (!brand) {
        return res.status(404).json({ error: 'Brand not found' });
    }

    await brand.destroy();
    res.status(200).json({ message: 'Brand deleted successfully' });
    req.io.emit('deleteBrand', id);
}));

// Error handling middleware
router.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
});

module.exports = router;