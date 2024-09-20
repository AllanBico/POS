const express = require('express');
const router = express.Router();
const { SerialNumber, Variant, Product} = require('../../models/associations');

// Create a new serial number
router.post('/', async (req, res) => {
    try {
        const { serial, variantId, stockMovementId } = req.body;
        const newSerialNumber = await SerialNumber.create({ serial, variantId, stockMovementId });
        res.status(201).json(newSerialNumber);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create serial number' });
    }
});

// Get all serial numbers
router.get('/', async (req, res) => {
    try {
        const serialNumbers = await SerialNumber.findAll({
            include: [{
                model: Variant,
                as: 'variant',
                include: [{ model: Product, as: 'Product' }]
            }],
        });
        res.status(200).json(serialNumbers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve serial numbers' });
    }
});

// Get a specific serial number by ID
router.get('/:id', async (req, res) => {
    try {
        const serialNumber = await SerialNumber.findByPk(req.params.id, {
            include: [{ model: Variant }],
        });
        if (!serialNumber) {
            return res.status(404).json({ error: 'Serial number not found' });
        }
        res.status(200).json(serialNumber);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve serial number' });
    }
});

// Update a serial number
router.put('/:id', async (req, res) => {
    try {
        const { serial, variantId, stockMovementId } = req.body;
        const serialNumber = await SerialNumber.findByPk(req.params.id);

        if (!serialNumber) {
            return res.status(404).json({ error: 'Serial number not found' });
        }

        await serialNumber.update({ serial, variantId, stockMovementId });
        res.status(200).json(serialNumber);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update serial number' });
    }
});

// Delete a serial number
router.delete('/:id', async (req, res) => {
    try {
        const serialNumber = await SerialNumber.findByPk(req.params.id);

        if (!serialNumber) {
            return res.status(404).json({ error: 'Serial number not found' });
        }

        await serialNumber.destroy();
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete serial number' });
    }
});

// Fetch all serial numbers by variantId
router.get('/variant/:variantId', async (req, res) => {
    try {
        const { variantId } = req.params;
        const serialNumbers = await SerialNumber.findAll({
            where: { variantId },
            include: [{ model: Variant }],
        });
        if (serialNumbers.length === 0) {
            return res.status(404).json({ message: 'No serial numbers found for this variant' });
        }
        res.status(200).json(serialNumbers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve serial numbers' });
    }
});


module.exports = router;
