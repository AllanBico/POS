// routes/paymentMethodRoutes.js
const express = require('express');
const router = express.Router();
const { PaymentMethod } = require('../models/associations'); // Adjust the import path if needed

// Get all payment methods
router.get('/', async (req, res) => {
    try {
        const paymentMethods = await PaymentMethod.findAll();
        res.json(paymentMethods);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching payment methods.' });
    }
});

// Get a single payment method by ID
router.get('/:id', async (req, res) => {
    try {
        const paymentMethod = await PaymentMethod.findByPk(req.params.id);
        if (paymentMethod) {
            res.json(paymentMethod);
        } else {
            res.status(404).json({ error: 'Payment method not found.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching the payment method.' });
    }
});

// Create a new payment method
router.post('/', async (req, res) => {
    try {
        const { name, description } = req.body;
        const newPaymentMethod = await PaymentMethod.create({ name, description });
        res.status(201).json(newPaymentMethod);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while creating the payment method.' });
    }
});

// Update an existing payment method
router.put('/:id', async (req, res) => {
    try {
        const { name, description } = req.body;
        const paymentMethod = await PaymentMethod.findByPk(req.params.id);
        if (paymentMethod) {
            await paymentMethod.update({ name, description });
            res.json(paymentMethod);
        } else {
            res.status(404).json({ error: 'Payment method not found.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while updating the payment method.' });
    }
});

// Delete a payment method
router.delete('/:id', async (req, res) => {

    try {
        const paymentMethod = await PaymentMethod.findByPk(req.params.id);
        if (paymentMethod) {
            await paymentMethod.destroy();
            res.status(204).end();
        } else {
            res.status(404).json({ error: 'Payment method not found.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while deleting the payment method.' });
    }
});

module.exports = router;
