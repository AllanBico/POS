const express = require('express');
const { Product, Variant } = require('../../models/associations');
const authenticateToken = require('../../middleware/auth');
const { ValidationError, Op } = require('sequelize');
const router = express.Router();

// Utility function to handle async routes
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Validate variant input
const validateVariantInput = (productId, priceOverride, sku, stockQuantity) => {
    if (!productId || typeof productId !== 'number' || isNaN(productId)) {
        const error = new Error('Valid productId is required');
        error.status = 400;
        return error;
    }
    if (priceOverride !== undefined && (typeof priceOverride !== 'number' || isNaN(priceOverride))) {
        const error = new Error('Invalid priceOverride');
        error.status = 400;
        return error;
    }
    if (sku && typeof sku !== 'string') {
        const error = new Error('Invalid sku');
        error.status = 400;
        return error;
    }
    if (stockQuantity !== undefined && (typeof stockQuantity !== 'number' || isNaN(stockQuantity))) {
        const error = new Error('Invalid stockQuantity');
        error.status = 400;
        return error;
    }
};

// Check for duplicate variant SKU
const checkDuplicateSku = async (sku, id = null) => {
    const whereClause = {
        sku: { [Op.iLike]: sku.toLowerCase() }
    };
    if (id) {
        whereClause.id = { [Op.ne]: id };
    }
    const existingVariant = await Variant.findOne({ where: whereClause });
    return !!existingVariant;
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

// Create a new product variant
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { productId, priceOverride, sku, stockQuantity } = req.body;
        const validationError = validateVariantInput(productId, priceOverride, sku, stockQuantity);
        if (validationError) {
            return res.status(400).json({ message: validationError.message });
        }
        const isDuplicate = await checkDuplicateSku(sku);
        if (isDuplicate) {
            return res.status(400).json({ message: 'Variant with this SKU already exists' });
        }
        const variant = await Variant.create({ productId, priceOverride, sku, stockQuantity });
        res.status(201).json({ data: { value: variant }, message: 'Variant created successfully' });
        emitToOthers(req, 'newVariant', variant);
    } catch (error) {
        if (error.status === 400) {
            res.status(400).json({ message: error.message });
        } else {
            throw error;
        }
    }
}));

// Get all product variants
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const variants = await Variant.findAll({
            include: [{ model: Product, attributes: ['name'] }],
        });
        res.status(200).json({ data: { value: variants }, message: 'Variants fetched successfully' });
    } catch (error) {
        console.error('Error fetching variants:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Get a product variant by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid variant ID' });
        }

        const variant = await Variant.findByPk(id, {
            include: [{ model: Product, attributes: ['name'] }],
        });
        if (!variant) {
            return res.status(404).json({ message: 'Variant not found' });
        }
        res.status(200).json({ data: { value: variant }, message: 'Variant fetched successfully' });
    } catch (error) {
        console.error('Error fetching variant:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Update a product variant
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { productId, priceOverride, sku, stockQuantity } = req.body;
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid variant ID' });
        }

        const validationError = validateVariantInput(productId, priceOverride, sku, stockQuantity);
        if (validationError) {
            return res.status(400).json({ message: validationError.message });
        }

        const isDuplicate = await checkDuplicateSku(sku, id);
        if (isDuplicate) {
            return res.status(400).json({ message: 'Variant with this SKU already exists' });
        }

        const variant = await Variant.findByPk(id);
        if (!variant) {
            return res.status(404).json({ message: 'Variant not found' });
        }

        variant.productId = productId || variant.productId;
        variant.priceOverride = priceOverride || variant.priceOverride;
        variant.sku = sku || variant.sku;
        variant.stockQuantity = stockQuantity || variant.stockQuantity;
        await variant.save();
        res.status(200).json({ data: { value: variant }, message: 'Variant updated successfully' });
        emitToOthers(req, 'updateVariant', variant);
    } catch (error) {
        if (error.status === 400) {
            res.status(400).json({ message: error.message });
        } else {
            console.error('Error updating variant:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}));

// Delete a product variant
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid variant ID' });
        }

        const deletedRowsCount = await Variant.destroy({ where: { id } });
        if (deletedRowsCount === 0) {
            return res.status(404).json({ message: 'Variant not found' });
        }

        res.status(200).json({ message: 'Variant deleted successfully' });
        emitToOthers(req, 'deleteVariant', id);
    } catch (error) {
        console.error('Error deleting variant:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Error handling middleware
router.use(handleError);

module.exports = router;