// routes/expenseCategory.js
const express = require('express');
const { ExpenseCategory } = require('../../models/associations');
const authenticateToken = require('../../middleware/auth');
const { ValidationError, Op } = require('sequelize');
const router = express.Router();

// Utility function to handle async routes
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Validate expense category input
const validateExpenseCategoryInput = (name) => {
    if (!name || typeof name !== 'string' || name.trim() === '') {
        const error = new Error('Valid name is required');
        error.status = 400;
        return error;
    }
};

// Check for duplicate expense category name
const checkDuplicateExpenseCategoryName = async (name, id = null) => {
    const whereClause = {
        name: { [Op.iLike]: name.toLowerCase() } // Use toLowerCase() for clarity
    };
    if (id) {
        whereClause.id = { [Op.ne]: id };
    }
    const existingExpenseCategory = await ExpenseCategory.findOne({ where: whereClause });
    return !!existingExpenseCategory; // Return true if a duplicate exists, false otherwise
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

// Get all expense categories
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const expenseCategories = await ExpenseCategory.findAll();
        res.status(200).json({ data: { value: expenseCategories }, message: 'Expense categories fetched successfully' }); // Changed response structure
    } catch (error) {
        console.error('Error fetching expense categories:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Get a single expense category by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid expense category ID' });
        }

        const expenseCategory = await ExpenseCategory.findByPk(id);
        if (!expenseCategory) {
            return res.status(404).json({ message: 'Expense category not found' });
        }
        res.status(200).json({ data: { value: expenseCategory }, message: 'Expense category fetched successfully' }); // Changed response structure
    } catch (error) {
        console.error('Error fetching expense category:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Create a new expense category
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { name, description } = req.body;
        validateExpenseCategoryInput(name);
        const isDuplicate = await checkDuplicateExpenseCategoryName(name); // Check for duplicate
        if (isDuplicate) {
            return res.status(400).json({ message: 'Expense category with this name already exists' });
        }
        const expenseCategory = await ExpenseCategory.create({ name, description });
        res.status(201).json({ data: { value: expenseCategory }, message: 'Expense category created successfully' }); // Added message field
        emitToOthers(req, 'newExpenseCategory', expenseCategory);
    } catch (error) {
        if (error.status === 400) {
            res.status(400).json({ message: error.message });
        } else {
            throw error;
        }
    }
}));

// Update an existing expense category
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { name, description } = req.body;
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid expense category ID' });
        }

        validateExpenseCategoryInput(name);
        const isDuplicate = await checkDuplicateExpenseCategoryName(name, id); // Check for duplicate
        if (isDuplicate) {
            return res.status(400).json({ message: 'Expense category with this name already exists' });
        }

        console.log('Updating expense category:', { id, name, description }); // Log for debugging

        const [updatedRowsCount, [updatedExpenseCategory]] = await ExpenseCategory.update(
            { name, description },
            { where: { id }, returning: true }
        );

        if (updatedRowsCount === 0) {
            return res.status(404).json({ error: 'Expense category not found' });
        }

        res.status(200).json({ data: { value: updatedExpenseCategory }, message: 'Expense category updated successfully' }); // Added message field
        emitToOthers(req, 'updateExpenseCategory', updatedExpenseCategory);
    } catch (error) {
        if (error.status === 400) {
            res.status(400).json({ message: error.message });
        } else {
            console.error('Error updating expense category:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}));

// Delete an expense category
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid expense category ID' });
        }

        const deletedRowsCount = await ExpenseCategory.destroy({ where: { id } });
        if (deletedRowsCount === 0) {
            return res.status(404).json({ message: 'Expense category not found' });
        }

        res.status(200).json({ message: 'Expense category deleted successfully' });
        emitToOthers(req, 'deleteExpenseCategory', id);
    } catch (error) {
        console.error('Error deleting expense category:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Error handling middleware
router.use(handleError);

module.exports = router;