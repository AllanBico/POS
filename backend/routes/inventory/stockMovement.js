const express = require('express');
const router = express.Router();
const { StockMovement,Inventory } = require('../../models/associations'); // Ensure correct path to StockMovement model
const authenticateToken = require('../../middleware/auth');
const sequelize = require('../../config/db');

router.post('/transfer', authenticateToken, async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        console.log('Request body:', req.body);
        const { variantId, quantity, sourceType, sourceId, destinationType, destinationId, createdBy } = req.body;

        // Decrease stock from the source location
        console.log('Querying source inventory');
        const sourceField = sourceType === 'warehouse' ? 'warehouseId' : 'storeId';
        const sourceInventory = await Inventory.findOne({
            where: {
                variantId,
                [sourceField]: sourceId,
            },
        });

        console.log('Source inventory:', sourceInventory);

        if (!sourceInventory || sourceInventory.quantity < quantity) {
            console.log('Insufficient stock in source location');
            return res.status(400).json({ error: 'Insufficient stock in source location' });
        }

        sourceInventory.quantity -= quantity;
        console.log('Updating source inventory');
        await sourceInventory.save({ transaction });

        // Increase stock in the destination location
        console.log('Querying destination inventory');
        const destinationField = destinationType === 'warehouse' ? 'warehouseId' : 'storeId';
        let destinationInventory = await Inventory.findOne({
            where: {
                variantId,
                [destinationField]: destinationId,
            },
        });

        console.log('Destination inventory:', destinationInventory);

        if (!destinationInventory) {
            console.log('Creating destination inventory');
            destinationInventory = await Inventory.create({
                variantId,
                [destinationField]: destinationId,
                quantity: quantity,  // Set initial quantity to the transferred amount
            }, { transaction });
        } else {
            console.log('Updating destination inventory');
            await destinationInventory.increment('quantity', { by: quantity, transaction });
        }

        // Create StockMovement record
        console.log('Creating stock movement record');
        console.log('User ID:', req.user.id);
        await StockMovement.create({
            variantId,
            quantity,
            transactionType: 'transfer',
            sourceType,
            sourceId,
            destinationType,
            destinationId,
            createdBy: req.user.id || createdBy,
        }, { transaction });

        console.log('Committing transaction');
        await transaction.commit();
        res.status(200).json({ message: 'Stock transfer completed successfully' });
    } catch (error) {
        console.log('Error:', error.message);
        console.log('Rolling back transaction');
        await transaction.rollback();
        res.status(500).json({ error: error.message });
    }
});

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
