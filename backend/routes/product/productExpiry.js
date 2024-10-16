const express = require('express');
const { ProductExpiry, GoodsReceivedLineItem } = require('../../models/associations');
const authenticateToken = require('../../middleware/auth');
const { ValidationError, Op } = require('sequelize');
const router = express.Router();

// Utility function to handle async routes
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Check for duplicate expiry record
const checkDuplicateExpiry = async (goodsReceivedLineItemId, id = null) => {
    const whereClause = {
        goodsReceivedLineItemId
    };
    if (id) {
        whereClause.id = { [Op.ne]: id };
    }
    const existingExpiry = await ProductExpiry.findOne({ where: whereClause });
    return !!existingExpiry; // Return true if a duplicate exists, false otherwise
};

// Emit socket event to all clients except the sender
const emitToOthers = (req, event, data) => {
    try {
        const socketId = req.headers['x-socket-id'];
        if (req.io && typeof req.io.emit === 'function') {
            req.io.emit(event, data, { except: socketId });
        }
    } catch (error) {
        console.error('Error emitting socket event:', error);
    }
};

// Middleware for handling 400 and 500 errors
const handleError = (err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        status: err.status || 500
    });
};

// Get all expiry records
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const expiries = await ProductExpiry.findAll({
            include: [GoodsReceivedLineItem]
        });
        res.status(200).json({ data: { value: expiries }, message: 'Expiry records fetched successfully' });
    } catch (error) {
        console.error('Error fetching expiry records:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Get an expiry record by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid expiry record ID' });
        }

        const expiry = await ProductExpiry.findByPk(id, {
            include: [GoodsReceivedLineItem]
        });
        if (!expiry) {
            return res.status(404).json({ message: 'Expiry record not found' });
        }
        res.status(200).json({ data: { value: expiry }, message: 'Expiry record fetched successfully' });
    } catch (error) {
        console.error('Error fetching expiry record:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Create a new expiry record
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { goodsReceivedLineItemId, expiryDate } = req.body;
        const isDuplicate = await checkDuplicateExpiry(goodsReceivedLineItemId);
        if (isDuplicate) {
            return res.status(400).json({ message: 'Expiry record with this variant already exists' });
        }
        const expiry = await ProductExpiry.create({
            goodsReceivedLineItemId,
            expiryDate
        });
        res.status(201).json({ data: { value: expiry }, message: 'Expiry record created successfully' });
        emitToOthers(req, 'newExpiry', expiry);
    } catch (error) {
        if (error.status === 400) {
            res.status(400).json({ message: error.message });
        } else {
            throw error;
        }
    }
}));

// Update an expiry record
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid expiry record ID' });
        }

        const { goodsReceivedLineItemId, expiryDate } = req.body;
        const isDuplicate = await checkDuplicateExpiry(goodsReceivedLineItemId, id);
        if (isDuplicate) {
            return res.status(400).json({ message: 'Expiry record with this variant already exists' });
        }
        const [updatedRowsCount, [updatedExpiry]] = await ProductExpiry.update(
            { goodsReceivedLineItemId, expiryDate },
            { where: { id }, returning: true }
        );

        if (updatedRowsCount === 0) {
            return res.status(404).json({ message: 'Expiry record not found' });
        }

        res.status(200).json({ data: { value: updatedExpiry }, message: 'Expiry record updated successfully' });
        emitToOthers(req, 'updateExpiry', updatedExpiry);
    } catch (error) {
        if (error.status === 400) {
            res.status(400).json({ message: error.message });
        } else {
            console.error('Error updating expiry record:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}));

// Delete an expiry record
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid expiry record ID' });
        }

        const deletedRowsCount = await ProductExpiry.destroy({ where: { id } });
        if (deletedRowsCount === 0) {
            return res.status(404).json({ message: 'Expiry record not found' });
        }

        res.status(200).json({ message: 'Expiry record deleted successfully' });
        emitToOthers(req, 'deleteExpiry', id);
    } catch (error) {
        console.error('Error deleting expiry record:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Error handling middleware
router.use(handleError);

module.exports = router;
