// routes/paymentMethod.js
const express = require('express');
const { PaymentMethod } = require('../../models/associations');
const authenticateToken = require("../../middleware/auth"); // Adjust the import path if needed
const { Op } = require('sequelize');
const router = express.Router();

// Utility function to handle async routes
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Validate payment method input
const validatePaymentMethodInput = (name) => {
    if (!name || typeof name !== 'string' || name.trim() === '') {
        const error = new Error('Valid name is required');
        error.status = 400;
        return error;
    }
};

// Check for duplicate payment method name
const checkDuplicateName = async (name, id = null) => {
    const whereClause = {
        name: { [Op.iLike]: name.toLowerCase() }
    };
    if (id) {
        whereClause.id = { [Op.ne]: id };
    }
    const existingPaymentMethod = await PaymentMethod.findOne({ where: whereClause });
    return !!existingPaymentMethod;
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

// Get all payment methods
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const paymentMethods = await PaymentMethod.findAll();
        res.status(200).json({ data: { value: paymentMethods }, message: 'Payment methods fetched successfully' });
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Get a single payment method by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid payment method ID' });
        }

        const paymentMethod = await PaymentMethod.findByPk(id);
        if (!paymentMethod) {
            return res.status(404).json({ message: 'Payment method not found' });
        }
        res.status(200).json({ data: { value: paymentMethod }, message: 'Payment method fetched successfully' });
    } catch (error) {
        console.error('Error fetching payment method:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Create a new payment method
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { name, description } = req.body;
        validatePaymentMethodInput(name);
        const isDuplicate = await checkDuplicateName(name);
        if (isDuplicate) {
            return res.status(400).json({ message: 'Payment method with this name already exists' });
        }
        const paymentMethod = await PaymentMethod.create({ name, description });
        res.status(201).json({ data: { value: paymentMethod }, message: 'Payment method created successfully' });
        emitToOthers(req, 'newPaymentMethod', paymentMethod);
    } catch (error) {
        if (error.status === 400) {
            res.status(400).json({ message: error.message });
        } else {
            throw error;
        }
    }
}));

// Update an existing payment method
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { name, description } = req.body;
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid payment method ID' });
        }

        validatePaymentMethodInput(name);
        const isDuplicate = await checkDuplicateName(name, id);
        if (isDuplicate) {
            return res.status(400).json({ message: 'Payment method with this name already exists' });
        }

        const [updatedRowsCount, [updatedPaymentMethod]] = await PaymentMethod.update(
            { name, description },
            { where: { id }, returning: true }
        );

        if (updatedRowsCount === 0) {
            return res.status(404).json({ error: 'Payment method not found' });
        }

        res.status(200).json({ data: { value: updatedPaymentMethod }, message: 'Payment method updated successfully' });
        emitToOthers(req, 'updatePaymentMethod', updatedPaymentMethod);
    } catch (error) {
        if (error.status === 400) {
            res.status(400).json({ message: error.message });
        } else {
            console.error('Error updating payment method:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}));

// Delete a payment method
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid payment method ID' });
        }

        const deletedRowsCount = await PaymentMethod.destroy({ where: { id } });
        if (deletedRowsCount === 0) {
            return res.status(404).json({ message: 'Payment method not found' });
        }

        res.status(200).json({ message: 'Payment method deleted successfully' });
        emitToOthers(req, 'deletePaymentMethod', id);
    } catch (error) {
        console.error('Error deleting payment method:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Error handling middleware
router.use(handleError);

module.exports = router;