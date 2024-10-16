const express = require('express');
const Store = require('../models/store');
const authenticateToken = require("../middleware/auth");
const { ValidationError, Op } = require('sequelize');
const router = express.Router();

// Utility function to handle async routes
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Validate store input
const validateStoreInput = (name, location, description) => {
    if (!name || typeof name !== 'string' || name.trim() === '') {
        const error = new Error('Valid name is required');
        error.status = 400;
        return error;
    }
    if (!location || typeof location !== 'string' || location.trim() === '') {
        const error = new Error('Valid location is required');
        error.status = 400;
        return error;
    }
    if (!description || typeof description !== 'string' || description.trim() === '') {
        const error = new Error('Valid description number is required');
        error.status = 400;
        return error;
    }
};

// Check for duplicate store name
const checkDuplicateName = async (name, id = null) => {
    const whereClause = {
        name: { [Op.iLike]: name.toLowerCase() }
    };
    if (id) {
        whereClause.id = { [Op.ne]: id };
    }
    const existingStore = await Store.findOne({ where: whereClause });
    return !!existingStore;
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

// Create a new store
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { name, location, description  } = req.body;
        validateStoreInput(name, location, description );
        const isDuplicate = await checkDuplicateName(name);
        if (isDuplicate) {
            return res.status(400).json({ message: 'Store with this name already exists' });
        }
        const store = await Store.create({ name, location, description  });
        res.status(201).json({ data: { value: store }, message: 'Store created successfully' });
        emitToOthers(req, 'newStore', store);
    } catch (error) {
        if (error.status === 400) {
            res.status(400).json({ message: error.message });
        } else {
            throw error;
        }
    }
}));

// Get all stores
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const stores = await Store.findAll();
        res.status(200).json({ data: { value: stores }, message: 'Stores fetched successfully' });
    } catch (error) {
        console.error('Error fetching stores:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Get a specific store by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid store ID' });
        }

        const store = await Store.findByPk(id);
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
        res.status(200).json({ data: { value: store }, message: 'Store fetched successfully' });
    } catch (error) {
        console.error('Error fetching store:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Update a store
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { name, location, description  } = req.body;
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({message: 'Invalid store ID' });
        }

        validateStoreInput(name, location, description );
        const isDuplicate = await checkDuplicateName(name, id);
        if (isDuplicate) {
            return res.status(400).json({ message: 'Store with this name already exists' });
        }

        console.log('Updating store:', { id, name, location, description }); // Log for debugging

        const [updatedRowsCount, [updatedStore]] = await Store.update(
            { name, location, description  },
            { where: { id }, returning: true }
        );

        if (updatedRowsCount === 0) {
            return res.status(404).json({ message: 'Store not found' });
        }

        res.status(200).json({ data: { value: updatedStore }, message: 'Store updated successfully' });
        emitToOthers(req, 'updateStore', updatedStore);
    } catch (error) {
        if (error.status === 400) {
            res.status(400).json({ message: error.message });
        } else {
            console.error('Error updating store:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}));

// Delete a store
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid store ID' });
        }

        const deletedRowsCount = await Store.destroy({ where: { id } });
        if (deletedRowsCount === 0) {
            return res.status(404).json({ message: 'Store not found' });
        }

        res.status(200).json({ message: 'Store deleted successfully' });
        emitToOthers(req, 'deleteStore', id);
    } catch (error) {
        console.error('Error deleting store:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Error handling middleware
router.use(handleError);

module.exports = router;