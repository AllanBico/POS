const express = require('express');
const router = express.Router();
const { Taxes } = require('../models/associations');

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
