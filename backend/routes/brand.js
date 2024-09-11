const express = require('express');
const {  Brand } = require('../models/associations');


const router = express.Router();
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Create a new brand
router.post('/', asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    if (!name || !description) {
        return res.status(400).json({ error: 'Name and description are required' });
    }

    const brand = await Brand.create({ name, description });
    res.status(201).json(brand);
    req.io.emit('newBrand', brand);
}));

// Get all brands
router.get('/', asyncHandler(async (req, res) => {
    const brands = await Brand.findAll();
    res.status(200).json(brands);
}));

// Get a single brand by ID
router.get('/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid Brand ID' });
    }

    const brand = await Brand.findByPk(id);
    if (!brand) return res.status(404).json({ error: 'Brand not found' });
    res.status(200).json(brand);
}));

// Update a brand
router.put('/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
    }

    const { name, description } = req.body;
    if (!name || !description) {
        return res.status(400).json({ error: 'Name and description are required' });
    }

    const brand = await Brand.findByPk(id);
    if (!brand) return res.status(404).json({ error: 'Brand not found' });

    brand.name = name;
    brand.description = description;
    await brand.save();
    const updatedBrand = await Brand.findByPk(id);
    res.status(200).json(updatedBrand);
    req.io.emit('updateBrand', updatedBrand);
}));

// Delete a brand (soft delete)
router.delete('/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
    }

    const brand = await Brand.findByPk(id);
    if (!brand) return res.status(404).json({ error: 'Brand not found' });

    await brand.destroy();
    res.status(204).json();
    req.io.emit('deleteBrand', id);
}));

module.exports = router;