const express = require('express');
const router = express.Router();
const { Payment } = require('../../models/associations');
const authenticateToken = require("../../middleware/auth"); // Adjust path as needed

// Create a new Payment
router.post('/',authenticateToken, async (req, res) => {
    try {
        const payment = await Payment.create(req.body);
        res.status(201).json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Error creating payment', error });
    }
});

// Get all Payments
router.get('/',authenticateToken, async (req, res) => {
    try {
        const payments = await Payment.findAll();
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payments', error });
    }
});

// Get a specific Payment by ID
router.get('/:id',authenticateToken, async (req, res) => {
    try {
        const payment = await Payment.findByPk(req.params.id);
        if (!payment) return res.status(404).json({ message: 'Payment not found' });
        res.status(200).json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payment', error });
    }
});

// Update a Payment
router.put('/:id',authenticateToken, async (req, res) => {
    try {
        const updatedPayment = await Payment.update(req.body, { where: { id: req.params.id } });
        res.status(200).json(updatedPayment);
    } catch (error) {
        res.status(500).json({ message: 'Error updating payment', error });
    }
});

// Delete a Payment
router.delete('/:id',authenticateToken, async (req, res) => {
    try {
        const deleted = await Payment.destroy({ where: { id: req.params.id } });
        if (deleted) return res.status(204).json();
        res.status(404).json({ message: 'Payment not found' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting payment', error });
    }
});

module.exports = router;
