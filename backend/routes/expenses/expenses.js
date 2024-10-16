const express = require('express');
const { Expense, ExpenseCategory, PaymentMethod, Supplier } = require('../../models/associations');
const authenticateToken = require('../../middleware/auth');
const { ValidationError, Op } = require('sequelize');
const router = express.Router();

// Utility function to handle async routes
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Validate expense input
const validateExpenseInput = (data) => {
    console.log('Validating expense input:', data.date,data.amount,data.expenseCategoryId,data.paymentMethodId,data.paidById);
    if (!data.date || !data.amount || !data.expenseCategoryId || !data.paymentMethodId || !data.paidById ) {
        const error = new Error('All fields are required');
        error.status = 400;
        return error;
    }

    if (typeof data.amount !== 'number' || data.amount <= 0) {
        const error = new Error('Invalid amount. Please enter a positive number');
        error.status = 400;
        return error;
    }
    if (typeof data.expenseCategoryId !== 'number' || data.expenseCategoryId <= 0) {
        const error = new Error('Invalid expense category ID');
        error.status = 400;
        return error;
    }
    if (typeof data.paymentMethodId !== 'number' || data.paymentMethodId <= 0) {
        const error = new Error('Invalid payment method ID');
        error.status = 400;
        return error;
    }
    if (typeof data.paidById !== 'number' || data.paidById <= 0) {
        const error = new Error('Invalid paid by user ID');
        error.status = 400;
        return error;
    }


    if (data.referenceNumber && typeof data.referenceNumber !== 'string') {
        const error = new Error('Reference number must be a string');
        error.status = 400;
        return error;
    }
    return null;
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

// Get all expenses
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const expenses = await Expense.findAll({
            include: [
                { model: ExpenseCategory, as: 'expenseCategory' },
                { model: PaymentMethod, as: 'paymentMethod' },
                { model: Supplier, as: 'supplier' }
            ]
        });
        res.status(200).json({ data: { value: expenses }, message: 'Expenses fetched successfully' });
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Get an expense by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid expense ID' });
        }

        const expense = await Expense.findByPk(id, {
            include: [
                { model: ExpenseCategory, as: 'expenseCategory' },
                { model: PaymentMethod, as: 'paymentMethod' },
                { model: Supplier, as: 'supplier' }
            ]
        });
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.status(200).json({ data: { value: expense }, message: 'Expense fetched successfully' });
    } catch (error) {
        console.error('Error fetching expense:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Create a new expense
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const validationError = validateExpenseInput(req.body);
        if (validationError) {
            return res.status(400).json({ message: validationError.message });
        }
        const expense = await Expense.create(req.body);
        const newExpense = await Expense.findByPk(expense.id, {
            include: [
                { model: ExpenseCategory, as: 'expenseCategory' },
                { model: PaymentMethod, as: 'paymentMethod' },
                { model: Supplier, as: 'supplier' }
            ]
        });
        res.status(201).json({ data: { value: newExpense }, message: 'Expense created successfully' });
        emitToOthers(req, 'newExpense', newExpense);
    } catch (error) {
        if (error.status === 400) {
            res.status(400).json({ message: error.message });
        } else {
            throw error;
        }
    }
}));

// Update an expense
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid expense ID' });
        }

        const validationError = validateExpenseInput(req.body);
        if (validationError) {
            return res.status(400).json({ message: validationError.message });
        }

        const [updatedRowsCount, [updatedExpense]] = await Expense.update(
            req.body,
            { where: { id }, returning: true }
        );

        if (updatedRowsCount === 0) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.status(200).json({ data: { value: updatedExpense }, message: 'Expense updated successfully' });
        emitToOthers(req, 'updateExpense', updatedExpense);
    } catch (error) {
        if (error.status === 400) {
            res.status(400).json({ message: error.message });
        } else {
            console.error('Error updating expense:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}));

// Delete an expense
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid expense ID' });
        }

        const deletedRowsCount = await Expense.destroy({ where: { id } });
        if (deletedRowsCount === 0) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.status(200).json({ message: 'Expense deleted successfully' });
        emitToOthers(req, 'deleteExpense', id);
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Error handling middleware
router.use(handleError);

module.exports = router;