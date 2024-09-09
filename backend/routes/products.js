const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Variant = require('../models/variant');
const VariantAttributeValue = require('../models/variantAttributeValue');


// Create a Product
router.post('/', async (req, res) => {
    try {
        const { name, description, categoryId, subcategoryId, vatType,brandId,lowStockAlert,unitId } = req.body;
        console.log("name, description, categoryId, subcategoryId, vatType,brandId,lowStockAlert,unitId",name, description, categoryId, subcategoryId, vatType,brandId,lowStockAlert,unitId)
        if (!name || !description || !categoryId || !subcategoryId || !vatType || !brandId || !lowStockAlert || !unitId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const product = await Product.create({ name, description, categoryId, subcategoryId, vatType,brandId,lowStockAlert,unitId });
        res.status(201).json(product);
    } catch (error) {
        console.log("error.message",error.message)
        res.status(500).json({ error: error.message });
    }
});

// Get all Products
router.get('/', async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [{ model: Variant, as: 'variants' }] // Include variants with each product
        });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a Product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [{ model: Variant, as: 'variants' }] // Include variants with the product
        });
        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a Product
router.put('/:id', async (req, res) => {
    try {
        const { name, description, price, sku, categoryId, subCategoryId, vatType } = req.body;
        const [updated] = await Product.update({ name, description, price, sku, categoryId, subCategoryId, vatType,brandId,lowStockAlert,unitId }, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedProduct = await Product.findByPk(req.params.id);
            res.status(200).json(updatedProduct);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a Product
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Product.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
