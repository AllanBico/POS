// routes/SubcategoryStore.js
const express = require('express');
const { Category, Subcategory } = require('../../models/associations');
const authenticateToken = require('../../middleware/auth');
const { ValidationError, Op } = require('sequelize');
const router = express.Router();

// Utility function to handle async routes
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Validate subcategory input
const validateSubcategoryInput = (name, description, categoryId) => {
    if (!name || typeof name !== 'string' || name.trim() === '') {
        const error = new Error('Valid name is required');
        error.status = 400;
        return error;
    }
    if (!description || typeof description !== 'string' || description.trim() === '') {
        const error = new Error('Valid description is required');
        error.status = 400;
        return error;
    }
    if (!categoryId) {
        const error = new Error('Valid categoryId is required');
        error.status = 400;
        return error;
    }
};

// Check for duplicate subcategory name
const checkDuplicateName = async (name, categoryId, id = null) => {
    const whereClause = {
        name: { [Op.iLike]: name.toLowerCase() },
        categoryId
    };
    if (id) {
        whereClause.id = { [Op.ne]: id };
    }
    const existingSubcategory = await Subcategory.findOne({ where: whereClause });
    return !!existingSubcategory; // Return true if a duplicate exists, false otherwise
};
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

// Create a subcategory
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { name, description, categoryId } = req.body;
        validateSubcategoryInput(name, description, categoryId);
        const isDuplicate = await checkDuplicateName(name, categoryId); // Check for duplicate
        if (isDuplicate) {
            return res.status(400).json({ message: 'Subcategory with this name already exists' });
        }
        const subcategory = await Subcategory.create({ name, description, categoryId });
        res.status(201).json({ data: { value: subcategory }, message: 'Subcategory created successfully' });
        emitToOthers(req, 'newSubcategory', subcategory);
    } catch (error) {
        if (error.status === 400) {
            res.status(400).json({ message: error.message });
        } else {
            throw error;
        }
    }
}));

// Get all subcategories
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const subcategories = await Subcategory.findAll({
            include: {
                model: Category,
                attributes: ['name']
            },
        });
        res.status(200).json({ data: { value: subcategories }, message: 'Subcategories fetched successfully' });
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Get a single subcategory by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid subcategory ID' });
        }

        const subcategory = await Subcategory.findByPk(id, {
            include: {
                model: Category,
                attributes: ['name']
            },
        });
        if (!subcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }
        res.status(200).json({ data: { value: subcategory }, message: 'Subcategory fetched successfully' });
    } catch (error) {
        console.error('Error fetching subcategory:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Update a subcategory by ID
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { name, description, categoryId } = req.body;
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid subcategory ID' });
        }

        validateSubcategoryInput(name, description, categoryId);
        const isDuplicate = await checkDuplicateName(name, categoryId, id); // Check for duplicate
        if (isDuplicate) {
            return res.status(400).json({ message: 'Subcategory with this name already exists' });
        }

        const [updatedRowsCount, [updatedSubcategory]] = await Subcategory.update(
            { name, description, categoryId },
            { where: { id }, returning: true }
        );

        if (updatedRowsCount === 0) {
            return res.status(404).json({ error: 'Subcategory not found' });
        }

        res.status(200).json({ data: { value: updatedSubcategory }, message: 'Subcategory updated successfully' });
        emitToOthers(req, 'updateSubcategory', updatedSubcategory);
    } catch (error) {
        if (error.status === 400) {
            res.status(400).json({ message: error.message });
        } else {
            console.error('Error updating subcategory:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}));

// Delete a subcategory by ID
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid subcategory ID' });
        }

        const deletedRowsCount = await Subcategory.destroy({ where: { id } });
        if (deletedRowsCount === 0) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }

        res.status(200).json({ message: 'Subcategory deleted successfully' });
        emitToOthers(req, 'deleteSubcategory', id);
    } catch (error) {
        console.error('Error deleting subcategory:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Error handling middleware
router.use(handleError);

module.exports = router;