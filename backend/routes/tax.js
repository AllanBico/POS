const express = require('express');
const { Taxes, ProductTax } = require('../models/associations');
const authenticateToken = require('../middleware/auth');
const { ValidationError, Op } = require('sequelize');
const router = express.Router();

// Utility function to handle async routes
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Validate tax input
const validateTaxInput = (name, rate, description) => {
    if (!name || typeof name !== 'string' || name.trim() === '') {
        const error = new Error('Valid name is required');
        error.status = 400;
        return error;
    }
    if (!rate || typeof rate !== 'number' || rate <= 0) {
        const error = new Error('Valid rate is required');
        error.status = 400;
        return error;
    }
    if (description && typeof description !== 'string') {
        const error = new Error('Description must be a string');
        error.status = 400;
        return error;
    }
};

// Check for duplicate tax name
const checkDuplicateName = async (name, id = null) => {
    const whereClause = {
        name: { [Op.iLike]: name.toLowerCase() }
    };
    if (id) {
        whereClause.id = { [Op.ne]: id };
    }
    const existingTax = await Taxes.findOne({ where: whereClause });
    return !!existingTax;
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
        message: err.message || 'Internal server error',
        status: err.status || 500
    });
};

// Get all taxes
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const taxes = await Taxes.findAll();
        res.status(200).json({ data: { value: taxes }, message: 'Taxes fetched successfully' });
    } catch (error) {
        console.error('Error fetching taxes:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Get single tax by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid tax ID' });
        }

        const tax = await Taxes.findByPk(id);
        if (!tax) {
            return res.status(404).json({ message: 'Tax not found' });
        }
        res.status(200).json({ data: { value: tax }, message: 'Tax fetched successfully' });
    } catch (error) {
        console.error('Error fetching tax:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Get taxIds for a product
router.get('/product/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const productId = parseInt(req.params.id, 10);
        if (isNaN(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const productTaxes = await ProductTax.findAll({
            where: { productId },
            attributes: ['taxId'],
        });

        const taxIds = productTaxes.map(pt => pt.taxId);
        res.status(200).json({ data: { value: taxIds }, message: 'Tax IDs fetched successfully' });
    } catch (error) {
        console.error('Error fetching product taxes:', error);
        res.status(500).json({ message: 'Failed to fetch product taxes' });
    }
}));

// Create a new tax
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { name, rate, description } = req.body;
        validateTaxInput(name, rate, description);
        const isDuplicate = await checkDuplicateName(name);
        if (isDuplicate) {
            return res.status(400).json({ message: 'Tax with this name already exists' });
        }
        const newTax = await Taxes.create({ name, rate, description });
        res.status(201).json({ data: { value: newTax }, message: 'Tax created successfully' });
        emitToOthers(req, 'newTax', newTax);
    } catch (error) {
        if (error.status === 400) {
            res.status(400).json({ message: error.message });
        } else {
            throw error;
        }
    }
}));

// Update an existing tax
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid tax ID' });
        }

        const { name, rate, description } = req.body;
        validateTaxInput(name, rate, description);
        const isDuplicate = await checkDuplicateName(name, id);
        if (isDuplicate) {
            return res.status(400).json({ message: 'Tax with this name already exists' });
        }

        const tax = await Taxes.findByPk(id);
        if (!tax) {
            return res.status(404).json({ message: 'Tax not found' });
        }

        await tax.update({ name, rate, description });
        res.status(200).json({ data: { value: tax }, message: 'Tax updated successfully' });
        emitToOthers(req, 'updateTax', tax);
    } catch (error) {
        if (error.status === 400) {
            res.status(400).json({ message: error.message });
        } else {
            console.error('Error updating tax:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}));

// Delete a tax
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid tax ID' });
        }

        const deletedRowsCount = await Taxes.destroy({ where: { id } });
        if (deletedRowsCount === 0) {
            return res.status(404).json({ message: 'Tax not found' });
        }

        res.status(200).json({ message: 'Tax deleted successfully' });
        emitToOthers(req, 'deleteTax', id);
    } catch (error) {
        console.error('Error deleting tax:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Error handling middleware
router.use(handleError);

module.exports = router;
