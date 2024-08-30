// routes/subcategory.js
const express = require('express');
const  Subcategory  = require('../models/subcategory');
const Category = require('../models/category')
const router = express.Router();

// Error handling middleware
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Create a subcategory
router.post('/', async (req, res) => {
    try {
        const { name, description, categoryId } = req.body;

        // Validate categoryId
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
    } catch (error) {
        console.error('Error creating subcategory:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all subcategories
router.get('/', async (req, res) => {
    try {
        const subcategories = await Subcategory.findAll({
            include: {
                model: Category,
                attributes: ['name'], // Only fetch the category name, or add other attributes if needed
            },
        });
        res.json(subcategories);
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get a single subcategory by ID
router.get('/:id', asyncHandler(async (req, res) => {
    const subcategory = await Subcategory.findByPk(req.params.id);
    if (!subcategory) return res.status(404).json({ error: 'Subcategory not found' });
    res.status(200).json(subcategory);
}));

// Update a subcategory by ID
router.put('/:id', asyncHandler(async (req, res) => {
    const { name, description, categoryId } = req.body;
    console.log("req.params.id", req.params.id);

    // Fetch the subcategory including the related category
    const subcategory = await Subcategory.findByPk(req.params.id, {
        include: {
            model: Category,
            attributes: ['name'], // Only fetch the category name
        },
    });

    if (!subcategory) {
        return res.status(404).json({ error: 'Subcategory not found' });
    }

    // Update the subcategory properties if they are provided in the request
    subcategory.name = name || subcategory.name;
    subcategory.description = description || subcategory.description;
    subcategory.categoryId = categoryId || subcategory.categoryId;

    // Save the updated subcategory
    await subcategory.save();
    const updatedsubcategory = await Subcategory.findByPk(req.params.id, {
        include: {
            model: Category,
            attributes: ['name'], // Only fetch the category name
        },
    });
    // Send the updated subcategory as the response
    res.status(200).json(updatedsubcategory);
}));


// Delete a subcategory by ID
router.delete('/:id', asyncHandler(async (req, res) => {
    const subcategory = await Subcategory.findByPk(req.params.id);
    if (!subcategory) return res.status(404).json({ error: 'Subcategory not found' });

    await subcategory.destroy(); // Soft delete because of `paranoid: true`
    res.status(204).json({ message: 'Subcategory deleted' });
}));

module.exports = router;
