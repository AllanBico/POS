const express = require('express');
const { Category } = require('../../models/associations');
const authenticateToken = require('../../middleware/auth');
const { ValidationError } = require('sequelize');
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

// Emit socket event to all clients except the sender
const emitToOthers = (req, event, data) => {
    const socketId = req.headers['x-socket-id'];
    const allSockets = req.io.sockets.sockets;
    // Emit to all sockets except the one with the specified socketId
    for (const [id, socket] of allSockets) {
        if (id !== socketId) {
            socket.emit(event, data);
        }
    }
};

// Create a category
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    validateCategoryInput(name);

    try {
        const category = await Category.create({ name, description });
        res.status(201).json(category);
        // Emit the event after sending the response
        setImmediate(() => {
            emitToOthers(req, 'newCategory', category);
        });
    } catch (error) {
        if (error instanceof ValidationError) {
            res.status(400).json({ error: error.errors.map(e => e.message) });
        } else {
            throw error;
        }
    }
}));

// Get all categories
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    const categories = await Category.findAll();
    res.status(200).json(categories);
}));

// Get a single category by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid category ID' });
    }

    const category = await Category.findByPk(id);
    if (!category) {
        return res.status(404).json({ error: 'Category not found' });
    }
    res.status(200).json(category);
}));

// Update a category by ID
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid category ID' });
    }

    validateCategoryInput(name);

    const [updatedRowsCount, [updatedCategory]] = await Category.update(
        { name, description },
        { where: { id }, returning: true }
    );

    if (updatedRowsCount === 0) {
        return res.status(404).json({ error: 'Category not found' });
    }

    res.status(200).json(updatedCategory);
    emitToOthers(req, 'updateCategory', updatedCategory);
}));

// Delete a category by ID
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid category ID' });
    }

    const deletedRowsCount = await Category.destroy({ where: { id } });
    if (deletedRowsCount === 0) {
        return res.status(404).json({ error: 'Category not found' });
    }

    res.status(204).send();
    emitToOthers(req, 'deleteCategory', id);
}));

// Error handling middleware
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

module.exports = router;