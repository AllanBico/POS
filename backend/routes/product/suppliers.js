// routes/suppliers.js
const express = require('express');
const { Supplier } = require('../../models/associations');
const authenticateToken = require('../../middleware/auth');
const { ValidationError, Op } = require('sequelize');
const router = express.Router();

// Utility function to handle async routes
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Validate supplier input
const validateSupplierInput = (name, contact, email) => {
    if (!name || typeof name !== 'string' || name.trim() === '') {
        const error = new Error('Valid name is required');
        error.status = 400;
        return error;
    }
    if (!contact || typeof contact !== 'string' || contact.trim() === '') {
        const error = new Error('Valid contact is required');
        error.status = 400;
        return error;
    }
    if (!email || typeof email !== 'string' || email.trim() === '' || !email.includes('@')) {
        const error = new Error('Valid email is required');
        error.status = 400;
        return error;
    }
};

// Check for duplicate supplier name
const checkDuplicateName = async (name, id = null) => {
    const whereClause = {
        name: { [Op.iLike]: name.toLowerCase() }
    };
    if (id) {
        whereClause.id = { [Op.ne]: id };
    }
    const existingSupplier = await Supplier.findOne({ where: whereClause });
    return !!existingSupplier;
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

// Get all suppliers
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const suppliers = await Supplier.findAll();
        res.status(200).json({ data: { value: suppliers }, message: 'Suppliers fetched successfully' });
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Get a supplier by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid supplier ID' });
        }

        const supplier = await Supplier.findByPk(id);
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        res.status(200).json({ data: { value: supplier }, message: 'Supplier fetched successfully' });
    } catch (error) {
        console.error('Error fetching supplier:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Create a new supplier
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { name, contact, email, phone } = req.body;
        validateSupplierInput(name, contact, email);
        const isDuplicate = await checkDuplicateName(name);
        if (isDuplicate) {
            return res.status(400).json({ message: 'Supplier with this name already exists' });
        }
        const supplier = await Supplier.create({ name, contact, email, phone });
        res.status(201).json({ data: { value: supplier }, message: 'Supplier created successfully' });
        emitToOthers(req, 'newSupplier', supplier);
    } catch (error) {
        if (error.status === 400) {
            res.status(400).json({ message: error.message });
        } else {
            throw error;
        }
    }
}));

// Update a supplier
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { name, contact, email, phone } = req.body;
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid supplier ID' });
        }

        validateSupplierInput(name, contact, email);
        const isDuplicate = await checkDuplicateName(name, id);
        if (isDuplicate) {
            return res.status(400).json({ message: 'Supplier with this name already exists' });
        }

        const [updatedRowsCount, [updatedSupplier]] = await Supplier.update(
            { name, contact, email, phone },
            { where: { id }, returning: true }
        );

        if (updatedRowsCount === 0) {
            return res.status(404).json({ error: 'Supplier not found' });
        }

        res.status(200).json({ data: { value: updatedSupplier }, message: 'Supplier updated successfully' });
        emitToOthers(req, 'updateSupplier', updatedSupplier);
    } catch (error) {
        if (error.status === 400) {
            res.status(400).json({ message: error.message });
        } else {
            console.error('Error updating supplier:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}));

// Delete a supplier
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid supplier ID' });
        }

        const deletedRowsCount = await Supplier.destroy({ where: { id } });
        if (deletedRowsCount === 0) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        res.status(200).json({ message: 'Supplier deleted successfully' });
        emitToOthers(req, 'deleteSupplier', id);
    } catch (error) {
        console.error('Error deleting supplier:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Error handling middleware
router.use(handleError);

module.exports = router;