// routes/subcategory.js
const express = require('express');
const {  Category, Subcategory } = require('../models/associations');
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// Error handling middleware
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Create a subcategory
router.post('/', authenticateToken,async (req, res) => {
    try {
        const { name, description, categoryId } = req.body;

        // Validate categoryId
        if (!categoryId) {
            return res.status(400).json({ error: 'Category ID is required' });
        }

        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(400).json({ error: 'Invalid category ID' });
        }

        // Create subcategory
        const subcategory = await Subcategory.create({
            name,
            description,
            categoryId
        });

        // Return the newly created subcategory with associated category info
        const createdSubcategory = await Subcategory.findByPk(subcategory.id, {
            include: {
                model: Category,
                attributes: ['name']
            }
        });

        res.status(201).json(createdSubcategory);
        req.io.emit('newSubcategory', createdSubcategory);
    } catch (error) {
        console.error('Error creating subcategory:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all subcategories
router.get('/', authenticateToken,async (req, res) => {
    try {
        const subcategories = await Subcategory.findAll({
            include: {
                model: Category,
                attributes: ['name']
            },
        });
        res.json(subcategories);
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get a single subcategory by ID
router.get('/:id', authenticateToken,asyncHandler(async (req, res) => {
    if (!req.params.id) {
        return res.status(400).json({ error: 'Subcategory ID is required' });
    }

    const subcategory = await Subcategory.findByPk(req.params.id);
    if (!subcategory) return res.status(404).json({ error: 'Subcategory not found' });
    res.status(200).json(subcategory);
}));

// Update a subcategory by ID
router.put('/:id', authenticateToken,asyncHandler(async (req, res) => {
    if (!req.params.id) {
        return res.status(400).json({ error: 'Subcategory ID is required' });
    }

    const { name, description, categoryId } = req.body;

    // Fetch the subcategory including the related category
    const subcategory = await Subcategory.findByPk(req.params.id, {
        include: {
            model: Category,
            attributes: ['name']
        },
    });

    if (!subcategory) {
        return res.status(404).json({ error: 'Subcategory not found' });
    }

    // Update the subcategory properties if they are provided in the request
    if (name) subcategory.name = name;
    if (description) subcategory.description = description;
    if (categoryId) subcategory.categoryId = categoryId;

    // Save the updated subcategory
    await subcategory.save();
    const updatedsubcategory = await Subcategory.findByPk(req.params.id, {
        include: {
            model: Category,
            attributes: ['name']
        },
    });
    // Send the updated subcategory as the response
    res.status(200).json(updatedsubcategory);
    req.io.emit('updateSubcategory', updatedsubcategory);
}));

// Delete a subcategory by ID
router.delete('/:id', authenticateToken,asyncHandler(async (req, res) => {
    if (!req.params.id) {
        return res.status(400).json({ error: 'Subcategory ID is required' });
    }

    const subcategory = await Subcategory.findByPk(parseInt(req.params.id));
    if (!subcategory) return res.status(404).json({ error: 'Subcategory not found' });

    await subcategory.destroy(); // Soft delete because of `paranoid: true`
    res.status(204).json({ message: 'Subcategory deleted' });
    req.io.emit('deleteSubcategory', req.params.id);
}));

module.exports = router;