const express = require('express');
const router = express.Router();
const { Product, Variant, Category, Subcategory, Unit, Attribute, AttributeValue, VariantAttributeValue,
    Inventory,
    Warehouse,
    Store, StockMovement
} = require('../../models/associations');
const authenticateToken = require("../../middleware/auth");
const sequelize = require('../../config/db');

// Create a Variant
router.post('/', authenticateToken, async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { sku, price, stockQuantity, productId, partNumber, code, destinationType, destinationId } = req.body;

        // Defensive checks
        if (!sku || !price || !stockQuantity || !productId || !destinationType || !destinationId) {
            throw new Error('Missing required fields');
        }

        if (stockQuantity <= 0) {
            throw new Error('Stock quantity must be greater than zero');
        }

        if (price < 0) {
            throw new Error('Price must be a positive number');
        }

        console.log("sku, price, stockQuantity, productId", sku, price, stockQuantity, productId, partNumber, code, destinationType, destinationId);

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
            createdBy:req.user.id,
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

        res.status(201).json(variant);
    } catch (error) {
        // Rollback transaction in case of error
        if (t) await t.rollback();

        console.error('Error creating variant or inventory:', error);
        res.status(500).json({ error: error.message });
    }
});


// Get all Variants
router.get('/',authenticateToken, async (req, res) => {
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
                },{model: Inventory, as: 'InventoryVariants',include: [{model: Warehouse, as: 'warehouse'}, {model: Store, as: 'store'}]},
                {
                    model: Product,
                    as: 'Product',
                    include: [
                        { model: Category, as: 'category', attributes: ['id', 'name'] }, // Include Category name
                        { model: Subcategory, as: 'subcategory', attributes: ['id', 'name'] }, // Include Subcategory name
                        { model: Unit, as: 'Unit', attributes: ['id', 'name','abbreviation'] }
                    ]
                }
            ]
        });
        res.status(200).json(variants);
    } catch (error) {
        console.error('Error fetching variants:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    }
});


// Get a Variant by ID
router.get('/:id',authenticateToken, async (req, res) => {
    try {
        const variant = await Variant.findByPk(req.params.id, {
            include: [{ model: VariantAttributeValue, as: 'variantAttributeValues' }]
        });
        if (variant) {
            res.status(200).json(variant);
        } else {
            res.status(404).json({ error: 'Variant not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a Variant
router.put('/:id',authenticateToken, async (req, res) => {
    try {
        const { sku, price, stockQuantity, productId } = req.body;
        const [updated] = await Variant.update({ sku, price, stockQuantity, productId }, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedVariant = await Variant.findByPk(req.params.id);
            res.status(200).json(updatedVariant);
        } else {
            res.status(404).json({ error: 'Variant not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a Variant
router.delete('/:id',authenticateToken, async (req, res) => {
    try {
        const deleted = await Variant.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Variant not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;