const express = require('express');
const { Attribute } = require('../../models/associations');
const authenticateToken = require('../../middleware/auth');
const { ValidationError, Op } = require('sequelize');
const router = express.Router();

// Utility function to handle async routes
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Validate attribute input
const validateAttributeInput = (name) => {
    if (!name || typeof name !== 'string' || name.trim() === '') {
        const error = new Error('Valid name is required');
        error.status = 400;
        return error;
    }
};

// Check for duplicate attribute name
const checkDuplicateName = async (name, id = null) => {
    const whereClause = {
        name: { [Op.iLike]: name.toLowerCase() } // Use toLowerCase() for clarity
    };
    if (id) {
        whereClause.id = { [Op.ne]: id };
    }
    const existingAttribute = await Attribute.findOne({ where: whereClause });
    return !!existingAttribute; // Return true if a duplicate exists, false otherwise
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

// Create an attribute
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { name, description } = req.body;
        const error = validateAttributeInput(name);
        if (error) {
            return res.status(400).json({ message: error.message });
        }
        const isDuplicate = await checkDuplicateName(name); // Check for duplicate
        if (isDuplicate) {
            return res.status(400).json({ message: 'Attribute with this name already exists' });
        }
        const attribute = await Attribute.create({ name, description });
        res.status(201).json({ data: { value: attribute }, message: 'Attribute created successfully' }); // Added message field
        emitToOthers(req, 'newAttribute', attribute);
    } catch (error) {
        console.error('Error creating attribute:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Get all attributes
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const attributes = await Attribute.findAll();
        res.status(200).json({ data: { value: attributes }, message: 'Attributes fetched successfully' }); // Changed response structure
    } catch (error) {
        console.error('Error fetching attributes:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Get a single attribute by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid attribute ID' });
        }

        const attribute = await Attribute.findByPk(id);
        if (!attribute) {
            return res.status(404).json({ message: 'Attribute not found' });
        }
        res.status(200).json({ data: { value: attribute }, message: 'Attribute fetched successfully' }); // Changed response structure
    } catch (error) {
        console.error('Error fetching attribute:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Update an attribute by ID
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { name, description } = req.body;
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid attribute ID' });
        }

        const error = validateAttributeInput(name);
        if (error) {
            return res.status(400).json({ message: error.message });
        }
        const isDuplicate = await checkDuplicateName(name, id); // Check for duplicate
        if (isDuplicate) {
            return res.status(400).json({ message: 'Attribute with this name already exists' });
        }

        console.log('Updating attribute:', { id, name, description }); // Log for debugging

        const [updatedRowsCount, [updatedAttribute]] = await Attribute.update(
            { name, description },
            { where: { id }, returning: true }
        );

        if (updatedRowsCount === 0) {
            return res.status(404).json({ error: 'Attribute not found' });
        }

        res.status(200).json({ data: { value: updatedAttribute }, message: 'Attribute updated successfully' }); // Added message field
        emitToOthers(req, 'updateAttribute', updatedAttribute);
    } catch (error) {
        console.error('Error updating attribute:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Delete an attribute by ID
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid attribute ID' });
        }

        const deletedRowsCount = await Attribute.destroy({ where: { id } });
        if (deletedRowsCount === 0) {
            return res.status(404).json({ message: 'Attribute not found' });
        }

        res.status(200).json({ message: 'Attribute deleted successfully' });
        emitToOthers(req, 'deleteAttribute', id);
    } catch (error) {
        console.error('Error deleting attribute:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Error handling middleware
router.use(handleError);

module.exports = router;