// routes/CategoryStore.js
const express = require('express');
const {  Category } = require('../../models/associations');
const authenticateToken = require('../../middleware/auth');
const router = express.Router();

// Error handling middleware
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Create a category
router.post('/', authenticateToken,asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    if (!name ) {
        return res.status(400).json({ error: 'Name is required' });
    }
    try {
        const category = await Category.create({ name, description });
        res.status(201).json(category);
        console.log("socket Id",req)
        req.io.emit('newCategory', category);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));

// Get all categories
router.get('/', authenticateToken, asyncHandler(async (req, res) => {

    try {
        const categories = await Category.findAll(); // Use Sequelize or your DB library
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}));

// Get a single category by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid category ID' });
    }

    const category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.status(200).json(category);
}));

// Update a category by ID
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid category ID' });
    }

    const category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    if (name) category.name = name;
    if (description) category.description = description;
    await category.save();
    res.status(200).json(category);

    req.io.emit('updateCategory', category);
}));

// Delete a category by ID
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid category ID' });
    }

    const category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    await category.destroy(); // Soft delete because of `paranoid: true`
    res.status(204).json({ message: 'Category deleted' });
    req.io.emit('deleteCategory', id);
}));

module.exports = router;