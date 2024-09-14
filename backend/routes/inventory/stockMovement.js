const express = require('express');
const router = express.Router();
const { StockMovement } = require('../../models/associations'); // Ensure correct path to StockMovement model
const authenticateToken = require('../../middleware/auth');

// CREATE StockMovement
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { variantId, quantity, transactionType, sourceType, sourceId, destinationType, destinationId, transactionDate, notes } = req.body;

        const stockMovement = await StockMovement.create({
            variantId,
            quantity,
            transactionType,
            sourceType,
            sourceId,
            destinationType,
            destinationId,
            transactionDate,
            notes,
        });

        res.status(201).json(stockMovement);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET all StockMovements
router.get('/', authenticateToken, async (req, res) => {
    try {
        const stockMovements = await StockMovement.findAll();
        res.status(200).json(stockMovements);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET a single StockMovement by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const stockMovement = await StockMovement.findByPk(req.params.id);

        if (!stockMovement) {
            return res.status(404).json({ error: 'StockMovement not found' });
        }

        res.status(200).json(stockMovement);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// UPDATE StockMovement
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { variantId, quantity, transactionType, sourceType, sourceId, destinationType, destinationId, transactionDate, notes } = req.body;
        const stockMovement = await StockMovement.findByPk(req.params.id);

        if (!stockMovement) {
            return res.status(404).json({ error: 'StockMovement not found' });
        }

        stockMovement.variantId = variantId;
        stockMovement.quantity = quantity;
        stockMovement.transactionType = transactionType;
        stockMovement.sourceType = sourceType;
        stockMovement.sourceId = sourceId;
        stockMovement.destinationType = destinationType;
        stockMovement.destinationId = destinationId;
        stockMovement.transactionDate = transactionDate;
        stockMovement.notes = notes;

        await stockMovement.save();
        res.status(200).json(stockMovement);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE StockMovement
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const stockMovement = await StockMovement.findByPk(req.params.id);

        if (!stockMovement) {
            return res.status(404).json({ error: 'StockMovement not found' });
        }

        await stockMovement.destroy();
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
