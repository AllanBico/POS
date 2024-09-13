const express = require('express');
const router = express.Router();
const  Customer  = require('../models/customer');
const authenticateToken = require("../middleware/auth");

// Create a new customer
router.post('/',authenticateToken, async (req, res) => {
    if (!req.body) {
        return res.status(400).json({ error: 'Missing request body' });
    }

    try {
        const customer = await Customer.create(req.body);
        res.status(201).json(customer);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all customers
router.get('/',authenticateToken, async (req, res) => {
    try {
        const customers = await Customer.findAll();
        res.status(200).json(customers);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get a specific customer by ID
router.get('/:id',authenticateToken, async (req, res) => {
    if (isNaN(parseInt(req.params.id))) {
        return res.status(400).json({ error: 'Invalid customer ID' });
    }

    try {
        const customer = await Customer.findByPk(req.params.id);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });
        res.status(200).json(customer);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update a customer
router.put('/:id',authenticateToken, async (req, res) => {
    if (isNaN(parseInt(req.params.id))) {
        return res.status(400).json({ error: 'Invalid customer ID' });
    }

    try {
        const customer = await Customer.findByPk(req.params.id);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });

        if (!req.body) {
            return res.status(400).json({ error: 'Missing request body' });
        }

        await customer.update(req.body);
        res.status(200).json(customer);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a customer
router.delete('/:id',authenticateToken, async (req, res) => {
    if (isNaN(parseInt(req.params.id))) {
        return res.status(400).json({ error: 'Invalid customer ID' });
    }

    try {
        const customer = await Customer.findByPk(req.params.id);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });

        await customer.destroy();
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;