const express = require('express');
const Brand = require('../models/brand');

const router = express.Router();
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
// Create a new brand
router.post('/', asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const brand = await Brand.create({ name, description });
    res.status(201).json(brand);
}));

// Get all brands
router.get('/', asyncHandler(async (req, res) => {
    const brands = await Brand.findAll();
    res.status(200).json(brands);
}));

// Get a single brand by ID
router.get('/:id', asyncHandler(async (req, res) => {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ error: 'Brand not found' });
    res.status(200).json(brand);
}));

// Update a brand
router.put('/:id', asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ error: 'Brand not found' });

    brand.name = name || brand.name;
    brand.description = description || brand.description;
    await brand.save();

    res.status(200).json(brand);
}));

// Delete a brand (soft delete)
router.delete('/:id', asyncHandler(async (req, res) => {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ error: 'Brand not found' });

    await brand.destroy();
    res.status(204).json();
}));

module.exports = router;
