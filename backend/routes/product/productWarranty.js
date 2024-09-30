const express = require('express');
const router = express.Router();
const { ProductWarranty, GoodsReceivedLineItem, Warranty } = require('../../models/associations');

// Get all warranties
router.get('/', async (req, res) => {
    try {
        const warranties = await ProductWarranty.findAll({
            include: [GoodsReceivedLineItem, Warranty]
        });
        res.json(warranties);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a warranty by ID
router.get('/:id', async (req, res) => {
    try {
        const warranty = await ProductWarranty.findByPk(req.params.id, {
            include: [GoodsReceivedLineItem, Warranty]
        });
        if (!warranty) {
            return res.status(404).json({ error: 'Warranty not found' });
        }
        res.json(warranty);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new warranty
router.post('/', async (req, res) => {
    const { goodsReceivedLineItemId, warrantyTypeId, warrantyStartDate, warrantyEndDate } = req.body;
    try {
        const warranty = await ProductWarranty.create({
            goodsReceivedLineItemId,
            warrantyTypeId,
            warrantyStartDate,
            warrantyEndDate
        });
        res.status(201).json(warranty);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update an existing warranty
router.put('/:id', async (req, res) => {
    try {
        const warranty = await ProductWarranty.findByPk(req.params.id);
        if (!warranty) {
            return res.status(404).json({ error: 'Warranty not found' });
        }

        const { goodsReceivedLineItemId, warrantyTypeId, warrantyStartDate, warrantyEndDate } = req.body;
        await warranty.update({
            goodsReceivedLineItemId,
            warrantyTypeId,
            warrantyStartDate,
            warrantyEndDate
        });
        res.json(warranty);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a warranty
router.delete('/:id', async (req, res) => {
    try {
        const warranty = await ProductWarranty.findByPk(req.params.id);
        if (!warranty) {
            return res.status(404).json({ error: 'Warranty not found' });
        }
        await warranty.destroy();
        res.json({ message: 'Warranty deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
