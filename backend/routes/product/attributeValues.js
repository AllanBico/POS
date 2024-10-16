const express = require('express');
const { AttributeValue } = require('../../models/associations');
const authenticateToken = require('../../middleware/auth');
const { ValidationError, Op } = require('sequelize');
const router = express.Router();

// Utility function to handle async routes
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Validate attribute value input
const validateAttributeValueInput = (value, attributeId) => {
    if (!value || typeof value !== 'string' || value.trim() === '') {
        const error = new Error('Valid value is required');
        error.status = 400;
        return error;
    }
    if (!attributeId || typeof attributeId !== 'number' || isNaN(attributeId)) {
        const error = new Error('Valid attribute ID is required');
        error.status = 400;
        return error;
    }
};

// Check for duplicate attribute value
const checkDuplicateValue = async (value, attributeId, id = null) => {
    const whereClause = {
        value: { [Op.iLike]: value.toLowerCase() },
        attributeId
    };
    if (id) {
        whereClause.id = { [Op.ne]: id };
    }
    const existingAttributeValue = await AttributeValue.findOne({ where: whereClause });
    return !!existingAttributeValue; // Return true if a duplicate exists, false otherwise
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

// Create AttributeValue
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { value, attributeId } = req.body;
        validateAttributeValueInput(value, attributeId);
        const isDuplicate = await checkDuplicateValue(value, attributeId); // Check for duplicate
        if (isDuplicate) {
            return res.status(400).json({ message: 'AttributeValue with this value already exists for this attribute' });
        }
        const attributeValue = await AttributeValue.create({ value, attributeId });
        res.status(201).json({ data: { value: attributeValue }, message: 'AttributeValue created successfully' });
        emitToOthers(req, 'newAttributeValue', attributeValue);
    } catch (error) {
        if (error.status === 400) {
            res.status(400).json({ message: error.message });
        } else {
            throw error;
        }
    }
}));

// Get All AttributeValues
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const attributeValues = await AttributeValue.findAll();
        res.status(200).json({ data: { value: attributeValues }, message: 'AttributeValues fetched successfully' });
    } catch (error) {
        console.error('Error fetching AttributeValues:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Get Single AttributeValue by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid attribute value ID' });
        }

        const attributeValue = await AttributeValue.findByPk(id);
        if (!attributeValue) {
            return res.status(404).json({ message: 'AttributeValue not found' });
        }
        res.status(200).json({ data: { value: attributeValue }, message: 'AttributeValue fetched successfully' });
    } catch (error) {
        console.error('Error fetching AttributeValue:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Update AttributeValue by ID
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { value, attributeId } = req.body;
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid attribute value ID' });
        }

        const attributeValue = await AttributeValue.findByPk(id);
        if (!attributeValue) return res.status(404).json({ message: 'AttributeValue not found' });

        if (value) {
            const isDuplicate = await checkDuplicateValue(value, attributeId, id); // Check for duplicate
            if (isDuplicate) {
                return res.status(400).json({ message: 'AttributeValue with this value already exists for this attribute' });
            }
            attributeValue.value = value;
        }

        if (attributeId) {
            attributeValue.attributeId = attributeId;
        }

        await attributeValue.save();
        const updatedAttributeValue = await AttributeValue.findByPk(id);
        res.status(200).json({ data: { value: updatedAttributeValue }, message: 'AttributeValue updated successfully' });
        emitToOthers(req, 'updateAttributeValue', updatedAttributeValue);
    } catch (error) {
        if (error.status === 400) {
            res.status(400).json({ message: error.message });
        } else {
            console.error('Error updating AttributeValue:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}));

// Delete AttributeValue by ID
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid attribute value ID' });
        }

        const deletedRowsCount = await AttributeValue.destroy({ where: { id } });
        if (deletedRowsCount === 0) {
            return res.status(404).json({ message: 'AttributeValue not found' });
        }

        res.status(200).json({ message: 'AttributeValue deleted successfully' });
        emitToOthers(req, 'deleteAttributeValue', id);
    } catch (error) {
        console.error('Error deleting AttributeValue:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Error handling middleware
router.use(handleError);

module.exports = router;