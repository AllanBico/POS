const express = require('express');
const Product = require('../models/product');
const Category = require('../models/category');
const Subcategory = require('../models/subcategory');
const router = express.Router();
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
// Create a new product
router.post('/', asyncHandler(async (req, res) => {
    const { name, description, price, sku, categoryId, subcategoryId } = req.body;
    const product = await Product.create({ name, description, price, sku, categoryId, subcategoryId });
    res.status(201).json(product);
}));

// Get all products
router.get('/', asyncHandler(async (req, res) => {
    const products = await Product.findAll({
        include: [
            { model: Category, as: 'Category' },
            { model: Subcategory, as: 'Subcategory' },
        ],
    });
    res.status(200).json(products);
}));

// Get a product by ID
router.get('/:id', asyncHandler(async (req, res) => {
    const product = await Product.findByPk(req.params.id, {
        include: [
            { model: Category, attributes: ['name'] },
            { model: Subcategory, attributes: ['name'] },
        ],
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.status(200).json(product);
}));

// Update a product
router.put('/:id', asyncHandler(async (req, res) => {
    const { name, description, price, sku, categoryId, subcategoryId } = req.body;
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.sku = sku || product.sku;
    product.categoryId = categoryId || product.categoryId;
    product.subcategoryId = subcategoryId || product.subcategoryId;
    await product.save();
    res.status(200).json(product);
}));

// Delete a product
router.delete('/:id', asyncHandler(async (req, res) => {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    await product.destroy();
    res.status(204).end();
}));

module.exports = router;
