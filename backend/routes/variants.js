const express = require('express');
const router = express.Router();
const { Product, Variant, Category, Subcategory, Unit, Attribute, AttributeValue, VariantAttributeValue } = require('../models/associations');


// Create a Variant
router.post('/', async (req, res) => {
    try {
        const { sku, price, stockQuantity, productId } = req.body;
        const variant = await Variant.create({ sku, price, stockQuantity, productId });
        res.status(201).json(variant);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all Variants
router.get('/', async (req, res) => {
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
                },
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
        res.status(500).json({ error: error.message });
    }
});


// Get a Variant by ID
router.get('/:id', async (req, res) => {
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
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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
