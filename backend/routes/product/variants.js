const express = require('express');
const { Variant, Product, Category, Subcategory, Unit, Attribute, AttributeValue, VariantAttributeValue,
    Inventory,
    Warehouse,
    Store, StockMovement
} = require('../../models/associations');
const authenticateToken = require("../../middleware/auth");
const { ValidationError, Op } = require('sequelize');
const sequelize = require('../../config/db');
const router = express.Router();

// Utility function to handle async routes
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Validate variant input
const validateVariantInput = (sku, price, stockQuantity, productId, destinationType, destinationId) => {
    if (!sku || typeof sku !== 'string' || sku.trim() === '') {
        const error = new Error('Valid sku is required');
        error.status = 400;
        return error;
    }
    if (!price || typeof price !== 'number' || price < 0) {
        const error = new Error('Valid price is required');
        error.status = 400;
        return error;
    }
    if (!stockQuantity || typeof stockQuantity !== 'number' || stockQuantity <= 0) {
        const error = new Error('Valid stock quantity is required');
        error.status = 400;
        return error;
    }
    if (!productId || typeof productId !== 'number') {
        const error = new Error('Valid product ID is required');
        error.status = 400;
        return error;
    }
    if (!destinationType || typeof destinationType !== 'string' || destinationType.trim() === '') {
        const error = new Error('Valid destination type is required');
        error.status = 400;
        return error;
    }
    if (!destinationId || typeof destinationId !== 'number') {
        const error = new Error('Valid destination ID is required');
        error.status = 400;
        return error;
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
const handleError = (err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        status: err.status || 500
    });
};
// Create a Variant
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { sku, price, stockQuantity, productId, partNumber, code, destinationType, destinationId } = req.body;
        validateVariantInput(sku, price, stockQuantity, productId, destinationType, destinationId);
        const t = await sequelize.transaction();
        try {
            // Check for duplicate variant
            const existingVariant = await Variant.findOne({ where: { sku, productId } });
            if (existingVariant) {
                return res.status(400).json({ message: 'Variant with this SKU and product already exists' });
            }

            // Creating variant
            const variant = await Variant.create(
                { sku, price, stockQuantity, productId, partNumber, code },
                { transaction: t }
            );

            // Creating stock movement
            const stockMovement = await StockMovement.create({
                variantId: variant.id,
                quantity: stockQuantity,
                transactionType: "opening_balance",
                sourceType: 'opening_balance',
                destinationType,
                destinationId,
                transactionDate: new Date().toISOString().split('T')[0],
                createdBy: req.user.id,
            }, { transaction: t });

            // Creating inventory record
            const newInventory = await Inventory.create({
                variantId: variant.id,
                warehouseId: destinationType === 'warehouse' ? destinationId : null,
                storeId: destinationType === 'store' ? destinationId : null,
                quantity: stockQuantity,
                costPrice: price,
            }, { transaction: t });

            // If everything passes, commit the transaction
            await t.commit();

            res.status(201).json({ data: { value: variant }, message: 'Variant created successfully' });
            emitToOthers(req, 'newVariant', variant);
        } catch (error) {
            // Rollback transaction in case of error
            if (t) await t.rollback();

            console.error('Error creating variant or inventory:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    } catch (error) {
        if (error.status === 400) {
            res.status(400).json({ message: error.message });
        } else {
            throw error;
        }
    }
}));

// Get all Variants
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const variants = await Variant.findAll({
            include: [
                {
                    model: VariantAttributeValue,
                    as: 'variantAttributeValues',
                    include: [
                        { model: AttributeValue, as: 'attributeValue', attributes: ['id', 'value'],
                            include: [
                                { model: Attribute, as: 'attribute', attributes: ['id', 'name'] } // Include Attribute name
                            ]
                        }
                    ]
                }, { model: Inventory, as: 'InventoryVariants', include: [{ model: Warehouse, as: 'warehouse' }, { model: Store, as: 'store' }] },
                {
                    model: Product,
                    as: 'Product',
                    include: [
                        { model: Category, as: 'category', attributes: ['id', 'name'] }, // Include Category name
                        { model: Subcategory, as: 'subcategory', attributes: ['id', 'name'] }, // Include Subcategory name
                        { model: Unit, as: 'Unit', attributes: ['id', 'name', 'abbreviation'] }
                    ]
                }
            ]
        });
        res.status(200).json({ data: { value: variants }, message: 'Variants fetched successfully' });
    } catch (error) {
        console.error('Error fetching variants:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Get a Variant by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid variant ID' });
        }

        const variant = await Variant.findByPk(id, {
            include: [
                {
                    model: VariantAttributeValue,
                    as: 'variantAttributeValues',
                    include: [
                        { model: AttributeValue, as: 'attributeValue', attributes: ['id', 'value'],
                            include: [
                                { model: Attribute, as: 'attribute', attributes: ['id', 'name'] } // Include Attribute name
                            ]
                        }
                    ]
                }, { model: Inventory, as: 'InventoryVariants', include: [{ model: Warehouse, as: 'warehouse' }, { model: Store, as: 'store' }] },
                {
                    model: Product,
                    as: 'Product',
                    include: [
                        { model: Category, as: 'category', attributes: ['id', 'name'] }, // Include Category name
                        { model: Subcategory, as: 'subcategory', attributes: ['id', 'name'] }, // Include Subcategory name
                        { model: Unit, as: 'Unit', attributes: ['id', 'name', 'abbreviation'] }
                    ]
                }
            ]
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

// Update a Variant
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { sku, price, stockQuantity, productId } = req.body;
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid variant ID' });
        }

        validateVariantInput(sku, price, stockQuantity, productId, null, null);

        // Check for duplicate variant (excluding the variant being updated)
        const existingVariant = await Variant.findOne({ where: { sku, productId, id: { [Op.ne]: id } } });
        if (existingVariant) {
            return res.status(400).json({ message: 'Variant with this SKU and product already exists' });
        }

        const [updatedRowsCount, [updatedVariant]] = await Variant.update(
            { sku, price, stockQuantity, productId },
            { where: { id }, returning: true }
        );

        if (updatedRowsCount === 0) {
            return res.status(404).json({ message: 'Variant not found' });
        }

        res.status(200).json({ data: { value: updatedVariant }, message: 'Variant updated successfully' });
        emitToOthers(req, 'updateVariant', updatedVariant);
    } catch (error) {
        if (error.status === 400) {
            res.status(400).json({ message: error.message });
        } else {
            console.error('Error updating variant:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}));

// Delete a Variant
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