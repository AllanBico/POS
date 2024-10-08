const express = require('express');
const { Brand } = require('../../models/associations');
const authenticateToken = require('../../middleware/auth');
const { Op } = require('sequelize');
const { ValidationError } = require('sequelize');
const router = express.Router();

// Utility function to handle async routes
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Validate brand input
const validateBrandInput = (name, description) => {
    if (!name || typeof name !== 'string' || name.trim() === '') {
        throw new ValidationError('Name is required and must be a non-empty string');
    }
    if (!description || typeof description !== 'string' || description.trim() === '') {
        throw new ValidationError('Description is required and must be a non-empty string');
    }
};

// Check for duplicate brand name
const checkDuplicateName = async (name, id = null) => {
    const whereClause = { name: name.trim() };
    if (id) {
        whereClause.id = { [Op.not]: id };
    }
    const existingBrand = await Brand.findOne({ where: whereClause });
    if (existingBrand) {
        throw new ValidationError('Brand with this name already exists');
    }
};

// Emit socket event to other clients
const emitToOthers = (req, event, data) => {
    const socketId = req.headers['x-socket-id'];
    if (req.io && typeof req.io.emit === 'function') {
        req.io.emit(event, data, { except: socketId });
    }
};

// Create a new brand
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    
    validateBrandInput(name, description);
    await checkDuplicateName(name);

    const brand = await Brand.create({ name: name.trim(), description: description.trim() });
    res.status(201).json({ data: brand, message: 'Brand created successfully' });
    emitToOthers(req, 'newBrand', brand);
}));

// Get all brands
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    const brands = await Brand.findAll();
    res.status(200).json({ data: brands });
}));

// Get a single brand by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid brand ID' });
    }

    const brand = await Brand.findByPk(id);
    if (!brand) {
        return res.status(404).json({ error: 'Brand not found' });
    }
    res.status(200).json({ data: brand });
}));

// Update a brand
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid brand ID' });
    }

    validateBrandInput(name, description);
    await checkDuplicateName(name, id);

    const [updatedRowsCount, [updatedBrand]] = await Brand.update(
        { name: name.trim(), description: description.trim() },
        { where: { id }, returning: true }
    );

    if (updatedRowsCount === 0) {
        return res.status(404).json({ error: 'Brand not found' });
    }

    res.status(200).json({ data: updatedBrand, message: 'Brand updated successfully' });
    emitToOthers(req, 'updateBrand', updatedBrand);
}));

// Delete a brand
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid brand ID' });
    }

    const deletedRowsCount = await Brand.destroy({ where: { id } });
    if (deletedRowsCount === 0) {
        return res.status(404).json({ error: 'Brand not found' });
    }

    res.status(200).json({ message: 'Brand deleted successfully' });
    emitToOthers(req, 'deleteBrand', id);
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