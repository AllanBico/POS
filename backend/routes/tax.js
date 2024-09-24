const express = require('express');
const router = express.Router();
const { Taxes,ProductTax } = require('../models/associations');

// Get all taxes
router.get('/', async (req, res) => {
    const taxes = await Taxes.findAll();
    res.json(taxes);
});

// Get single tax by ID
router.get('/:id', async (req, res) => {
    const tax = await Taxes.findByPk(req.params.id);
    if (!tax) {
        return res.status(404).json({ error: 'Tax not found' });
    }
    res.json(tax);
});
router.get('/product/:id', async (req, res) => {
    try {
        const  productId  = req.params.id;

        // Fetch all ProductTax records for the given productId
        const productTaxes = await ProductTax.findAll({
            where: { productId },
            attributes: ['taxId'], // Only return the taxId
        });

        // Extract taxIds from the result
        const taxIds = productTaxes.map(pt => pt.taxId);

        // Return the taxIds as a response
        res.json({ taxIds });
    } catch (error) {
        console.error('Error fetching product taxes:', error);
        res.status(500).json({ message: 'Failed to fetch product taxes' });
    }
});

// Create a new tax
router.post('/', async (req, res) => {
    const { name, rate, description } = req.body;
    const newTax = await Taxes.create({ name, rate, description });
    res.status(201).json(newTax);
});

// Update an existing tax
router.put('/:id', async (req, res) => {
    const tax = await Taxes.findByPk(req.params.id);
    if (!tax) {
        return res.status(404).json({ error: 'Tax not found' });
    }
    const { name, rate, description } = req.body;
    await tax.update({ name, rate, description });
    res.json(tax);
});

// Delete a tax
router.delete('/:id', async (req, res) => {
    const tax = await Taxes.findByPk(req.params.id);
    if (!tax) {
        return res.status(404).json({ error: 'Tax not found' });
    }
    await tax.destroy();
    res.status(204).send();
});

module.exports = router;
