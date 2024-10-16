const express = require('express');
const { Warehouse } = require('../models/associations'); // Import Warehouse model from associations
const authenticateToken = require('../middleware/auth');
const { ValidationError, Op } = require('sequelize');
const router = express.Router();

// Utility function to handle async routes
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Validate warehouse input
const validateWarehouseInput = (name, location, description) => {
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

};

// Check for duplicate warehouse name
const checkDuplicateName = async (name, id = null) => {
    const whereClause = {
        name: { [Op.iLike]: name.toLowerCase() }
    };
    if (id) {
        whereClause.id = { [Op.ne]: id };
    }
    const existingWarehouse = await Warehouse.findOne({ where: whereClause });
    return !!existingWarehouse;
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

// Create a new warehouse
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { name, location, description } = req.body;
        validateWarehouseInput(name, location);
        const isDuplicate = await checkDuplicateName(name);
        if (isDuplicate) {
            console.log('Duplicate warehouse name:', name);
            return res.status(400).json({ message: 'Warehouse with this name already exists' });            
        }
        const warehouse = await Warehouse.create({ name, location, description });
        res.status(201).json({ data: { value: warehouse }, message: 'Warehouse created successfully' });
        emitToOthers(req, 'newWarehouse', warehouse);
    } catch (error) {
        if (error.status === 400) {
            res.status(400).json({ message: error.message });
        } else {
            throw error;
        }
    }
}));

// Get all warehouses
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const warehouses = await Warehouse.findAll();
        res.status(200).json({ data: { value: warehouses }, message: 'Warehouses fetched successfully' });
    } catch (error) {
        console.error('Error fetching warehouses:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Get a specific warehouse by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid warehouse ID' });
        }

        const warehouse = await Warehouse.findByPk(id);
        if (!warehouse) {
            return res.status(404).json({ message: 'Warehouse not found' });
        }
        res.status(200).json({ data: { value: warehouse }, message: 'Warehouse fetched successfully' });
    } catch (error) {
        console.error('Error fetching warehouse:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Update a warehouse
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { name, location, description } = req.body;
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid warehouse ID' });
        }

        validateWarehouseInput(name, location, description);
        const isDuplicate = await checkDuplicateName(name, id);
        if (isDuplicate) {
            return res.status(400).json({ message: 'Warehouse with this name already exists' });
        }

        const [updatedRowsCount, [updatedWarehouse]] = await Warehouse.update(
            { name, location, description },
            { where: { id }, returning: true }
        );

        if (updatedRowsCount === 0) {
            return res.status(404).json({ message: 'Warehouse not found' });
        }

        res.status(200).json({ data: { value: updatedWarehouse }, message: 'Warehouse updated successfully' });
        emitToOthers(req, 'updateWarehouse', updatedWarehouse);
    } catch (error) {
        if (error.status === 400) {
            res.status(400).json({ message: error.message });
        } else {
            console.error('Error updating warehouse:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}));

// Delete a warehouse
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid warehouse ID' });
        }

        const deletedRowsCount = await Warehouse.destroy({ where: { id } });
        if (deletedRowsCount === 0) {
            return res.status(404).json({ message: 'Warehouse not found' });
        }

        res.status(200).json({ message: 'Warehouse deleted successfully' });
        emitToOthers(req, 'deleteWarehouse', id);
    } catch (error) {
        console.error('Error deleting warehouse:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Error handling middleware
router.use(handleError);

module.exports = router;