// routes/serialNumbers.js
const express = require('express');
const router = express.Router();
const { Product,  SerialNumber } = require('../models/associations');
const authenticateToken = require("../middleware/auth");


// Get all serial numbers
router.get('/',authenticateToken, async (req, res) => {
    try {
        const serialNumbers = await SerialNumber.findAll({ include: [Product] });
        res.json(serialNumbers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve serial numbers' });
    }
});

// Get serial number by ID
router.get('/:id',authenticateToken, async (req, res) => {
    try {
        const serialNumber = await SerialNumber.findByPk(req.params.id, { include: [Product] });
        if (!serialNumber) return res.status(404).json({ error: 'Serial number not found' });
        res.json(serialNumber);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve serial number' });
    }
});

// Create a serial number
router.post('/',authenticateToken, async (req, res) => {
    try {
        const { serialNumber, productId, status } = req.body;
        const newSerialNumber = await SerialNumber.create({ serialNumber, productId, status });
        res.json(newSerialNumber);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create serial number' });
    }
});

// Update a serial number
router.put('/:id',authenticateToken, async (req, res) => {
    try {
        const { serialNumber, productId, status } = req.body;
        const updated = await SerialNumber.update({ serialNumber, productId, status }, {
            where: { id: req.params.id },
        });
        if (!updated) return res.status(404).json({ error: 'Serial number not found' });
        res.json({ message: 'Serial number updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update serial number' });
    }
});

// Delete a serial number
router.delete('/:id',authenticateToken, async (req, res) => {
    try {
        const deleted = await SerialNumber.destroy({ where: { id: req.params.id } });
        if (!deleted) return res.status(404).json({ error: 'Serial number not found' });
        res.json({ message: 'Serial number deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete serial number' });
    }
});

module.exports = router;