const express = require('express');
const { Product, Variant} = require('../models/associations');

const router = express.Router();
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
// Create a new product variant
router.post('/', asyncHandler(async (req, res) => {
    const { productId, priceOverride, sku, stockQuantity } = req.body;
    const variant = await Variant.create({ productId, priceOverride, sku, stockQuantity });
    res.status(201).json(variant);
}));

// Get all product variants
router.get('/', asyncHandler(async (req, res) => {
    const variants = await Variant.findAll({
        include: [{ model: Product, attributes: ['name'] }],
    });
    res.status(200).json(variants);
}));

// Get a product variant by ID
router.get('/:id', asyncHandler(async (req, res) => {
    const variant = await Variant.findByPk(req.params.id, {
        include: [{ model: Product, attributes: ['name'] }],
    });
    if (!variant) return res.status(404).json({ error: 'Variant not found' });
    res.status(200).json(variant);
}));

// Update a product variant
router.put('/:id', asyncHandler(async (req, res) => {
    const { productId, priceOverride, sku, stockQuantity } = req.body;
    const variant = await Variant.findByPk(req.params.id);
    if (!variant) return res.status(404).json({ error: 'Variant not found' });

    variant.productId = productId || variant.productId;
    variant.priceOverride = priceOverride || variant.priceOverride;
    variant.sku = sku || variant.sku;
    variant.stockQuantity = stockQuantity || variant.stockQuantity;
    await variant.save();
    res.status(200).json(variant);
}));

// Delete a product variant
router.delete('/:id', asyncHandler(async (req, res) => {
    const variant = await Variant.findByPk(req.params.id);
    if (!variant) return res.status(404).json({ error: 'Variant not found' });
    await variant.destroy();
    res.status(204).end();
}));

module.exports = router;
