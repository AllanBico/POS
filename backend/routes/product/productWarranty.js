const express = require('express');
const { ProductWarranty, GoodsReceivedLineItem, Warranty } = require('../../models/associations');
const authenticateToken = require('../../middleware/auth');
const { ValidationError, Op } = require('sequelize');
const router = express.Router();

// Utility function to handle async routes
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Validate warranty input
const validateWarrantyInput = (goodsReceivedLineItemId, warrantyTypeId, warrantyStartDate, warrantyEndDate) => {
    if (!goodsReceivedLineItemId || !warrantyTypeId || !warrantyStartDate || !warrantyEndDate) {
        const error = new Error('Valid goodsReceivedLineItemId, warrantyTypeId, warrantyStartDate, and warrantyEndDate are required');
        error.status = 400;
        return error;
    }
};

// Check for duplicate warranty
const checkDuplicateWarranty = async (goodsReceivedLineItemId, warrantyTypeId, id = null) => {
    const whereClause = {
        goodsReceivedLineItemId,
        warrantyTypeId
    };
    if (id) {
        whereClause.id = { [Op.ne]: id };
    }
    const existingWarranty = await ProductWarranty.findOne({ where: whereClause });
    return !!existingWarranty; // Return true if a duplicate exists, false otherwise
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

// Get all warranties
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const warranties = await ProductWarranty.findAll({
            include: [GoodsReceivedLineItem, Warranty]
        });
        res.status(200).json({ data: { value: warranties }, message: 'Warranties fetched successfully' });
    } catch (error) {
        console.error('Error fetching warranties:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Get a warranty by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid warranty ID' });
        }

        const warranty = await ProductWarranty.findByPk(id, {
            include: [GoodsReceivedLineItem, Warranty]
        });
        if (!warranty) {
            return res.status(404).json({ message: 'Warranty not found' });
        }
        res.status(200).json({ data: { value: warranty }, message: 'Warranty fetched successfully' });
    } catch (error) {
        console.error('Error fetching warranty:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Create a new warranty
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { goodsReceivedLineItemId, warrantyTypeId, warrantyStartDate, warrantyEndDate } = req.body;
        validateWarrantyInput(goodsReceivedLineItemId, warrantyTypeId, warrantyStartDate, warrantyEndDate);
        const isDuplicate = await checkDuplicateWarranty(goodsReceivedLineItemId, warrantyTypeId); // Check for duplicate
        if (isDuplicate) {
            return res.status(400).json({ message: 'Warranty with this goodsReceivedLineItemId and warrantyTypeId already exists' });
        }
        const warranty = await ProductWarranty.create({
            goodsReceivedLineItemId,
            warrantyTypeId,
            warrantyStartDate,
            warrantyEndDate
        });
        res.status(201).json({ data: { value: warranty }, message: 'Warranty created successfully' });
        emitToOthers(req, 'newWarranty', warranty);
    } catch (error) {
        if (error.status === 400) {
            res.status(400).json({ message: error.message });
        } else {
            throw error;
        }
    }
}));

// Update an existing warranty
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { goodsReceivedLineItemId, warrantyTypeId, warrantyStartDate, warrantyEndDate } = req.body;
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid warranty ID' });
        }

        validateWarrantyInput(goodsReceivedLineItemId, warrantyTypeId, warrantyStartDate, warrantyEndDate);
        const isDuplicate = await checkDuplicateWarranty(goodsReceivedLineItemId, warrantyTypeId, id); // Check for duplicate
        if (isDuplicate) {
            return res.status(400).json({ message: 'Warranty with this goodsReceivedLineItemId and warrantyTypeId already exists' });
        }

        const [updatedRowsCount, [updatedWarranty]] = await ProductWarranty.update(
            { goodsReceivedLineItemId, warrantyTypeId, warrantyStartDate, warrantyEndDate },
            { where: { id }, returning: true }
        );

        if (updatedRowsCount === 0) {
            return res.status(404).json({ error: 'Warranty not found' });
        }

        res.status(200).json({ data: { value: updatedWarranty }, message: 'Warranty updated successfully' });
        emitToOthers(req, 'updateWarranty', updatedWarranty);
    } catch (error) {
        if (error.status === 400) {
            res.status(400).json({ message: error.message });
        } else {
            console.error('Error updating warranty:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}));

// Delete a warranty
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid warranty ID' });
        }

        const deletedRowsCount = await ProductWarranty.destroy({ where: { id } });
        if (deletedRowsCount === 0) {
            return res.status(404).json({ message: 'Warranty not found' });
        }

        res.status(200).json({ message: 'Warranty deleted successfully' });
        emitToOthers(req, 'deleteWarranty', id);
    } catch (error) {
        console.error('Error deleting warranty:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Error handling middleware
router.use(handleError);

module.exports = router;
