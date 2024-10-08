const express = require('express');
const { Category } = require('../../models/associations');
const authenticateToken = require('../../middleware/auth');
const { ValidationError, Op } = require('sequelize');
const router = express.Router();

// Utility function to handle async routes
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Validate category input
const validateCategoryInput = (name) => {
    if (!name || typeof name !== 'string' || name.trim() === '') {
        const error = new Error('Valid name is required');
        error.status = 400;
        throw error;
    }
};

// Check for duplicate category name
const checkDuplicateName = async (name, id = null) => {
    const whereClause = {
        name: { [Op.iLike]: name }
    };
    if (id) {
        whereClause.id = { [Op.ne]: id };
    }
    const existingCategory = await Category.findOne({ where: whereClause });
    if (existingCategory) {
        const error = new Error('Category with this name already exists');
        error.status = 400;
        throw error;
    }
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

// Create a category
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { name, description } = req.body;
        validateCategoryInput(name);
        await checkDuplicateName(name);

        const category = await Category.create({ name, description });
        res.status(201).json({ data: category, message: 'Category created successfully' });
        emitToOthers(req, 'newCategory', category);
    } catch (error) {
        if (error instanceof ValidationError || error.status === 400) {
            res.status(400).json({ error: error.message });
        } else {
            throw error;
        }
    }
}));

// Get all categories
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.status(200).json({ data: categories, message: 'Categories fetched successfully' });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));

// Get a single category by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid category ID' });
        }

        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.status(200).json({ data: category, message: 'Category fetched successfully' });
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));

// Update a category by ID
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { name, description } = req.body;
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid category ID' });
        }

        validateCategoryInput(name);
        await checkDuplicateName(name, id);

        const [updatedRowsCount, [updatedCategory]] = await Category.update(
            { name, description },
            { where: { id }, returning: true }
        );

        if (updatedRowsCount === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.status(200).json({ data: updatedCategory, message: 'Category updated successfully' });
        emitToOthers(req, 'updateCategory', updatedCategory);
    } catch (error) {
        if (error instanceof ValidationError || error.status === 400) {
            res.status(400).json({ error: error.message });
        } else {
            console.error('Error updating category:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}));

// Delete a category by ID
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid category ID' });
        }

        const deletedRowsCount = await Category.destroy({ where: { id } });
        if (deletedRowsCount === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.status(200).json({ message: 'Category deleted successfully' });
        emitToOthers(req, 'deleteCategory', id);
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));

// Error handling middleware
router.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        status: err.status || 500
    });
});

module.exports = router;