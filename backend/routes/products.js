const express = require('express');
const router = express.Router();
const db = require('../models/user'); // Adjust based on your database setup

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await db.Product.findAll(); // Use Sequelize or your DB library
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Get a specific product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await db.Product.findByPk(req.params.id); // Use Sequelize or your DB library
        if (product) {
            res.json(product);
        } else {
            res.status(404).send('Product not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Create a new product
router.post('/', async (req, res) => {
    try {
        const newProduct = await db.Product.create(req.body); // Use Sequelize or your DB library
        res.status(201).json(newProduct);
    } catch (err) {
        console.error(err);
        res.status(400).send('Bad request');
    }
});

// Update a product
router.put('/:id', async (req, res) => {
    try {
        const [updated] = await db.Product.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedProduct = await db.Product.findByPk(req.params.id);
            res.json(updatedProduct);
        } else {
            res.status(404).send('Product not found');
        }
    } catch (err) {
        console.error(err);
        res.status(400).send('Bad request');
    }
});

// Delete a product
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await db.Product.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).send('Product not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
