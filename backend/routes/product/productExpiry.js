const express = require('express');
const router = express.Router();
const { ProductExpiry, GoodsReceivedLineItem } = require('../../models/associations');

// Get all expiry records
router.get('/', async (req, res) => {
    try {
        const expiries = await ProductExpiry.findAll({
            include: [GoodsReceivedLineItem]
        });
        res.json(expiries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get an expiry record by ID
router.get('/:id', async (req, res) => {
    try {
        const expiry = await ProductExpiry.findByPk(req.params.id, {
            include: [GoodsReceivedLineItem]
        });
        if (!expiry) {
            return res.status(404).json({ error: 'Expiry record not found' });
        }
        res.json(expiry);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new expiry record
router.post('/', async (req, res) => {
    const { goodsReceivedLineItemId, expiryDate } = req.body;
    try {
        const expiry = await ProductExpiry.create({
            goodsReceivedLineItemId,
            expiryDate
        });
        res.status(201).json(expiry);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update an expiry record
router.put('/:id', async (req, res) => {
    try {
        const expiry = await ProductExpiry.findByPk(req.params.id);
        if (!expiry) {
            return res.status(404).json({ error: 'Expiry record not found' });
        }

        const { goodsReceivedLineItemId, expiryDate } = req.body;
        await expiry.update({
            goodsReceivedLineItemId,
            expiryDate
        });
        res.json(expiry);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete an expiry record
router.delete('/:id', async (req, res) => {
    try {
        const expiry = await ProductExpiry.findByPk(req.params.id);
        if (!expiry) {
            return res.status(404).json({ error: 'Expiry record not found' });
        }
        await expiry.destroy();
        res.json({ message: 'Expiry record deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
