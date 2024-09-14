const express = require('express');
const {  Variant,  AttributeValue,  VariantAttributeValue } = require('../../models/associations');
const authenticateToken = require("../../middleware/auth");

const router = express.Router();
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
// Create a new variant attribute value
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    const { variantId, attributeValueId } = req.body;
    console.log("variantId, attributeValueId",variantId, attributeValueId)
    const variantAttributeValue = await VariantAttributeValue.create({ variantId, attributeValueId });
    res.status(201).json(variantAttributeValue);
}));

// Get all variant attribute values
router.get('/',authenticateToken, asyncHandler(async (req, res) => {
    const variantAttributeValues = await VariantAttributeValue.findAll({
        include: [
            { model: Variant, attributes: ['sku'] },
            { model: AttributeValue, attributes: ['value'] },
        ],
    });
    res.status(200).json(variantAttributeValues);
}));

// Get a variant attribute value by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const variantAttributeValue = await VariantAttributeValue.findByPk(req.params.id, {
        include: [
            { model: Variant, attributes: ['sku'] },
            { model: AttributeValue, attributes: ['value'] },
        ],
    });
    if (!variantAttributeValue) return res.status(404).json({ error: 'Variant Attribute Value not found' });
    res.status(200).json(variantAttributeValue);
}));

// Update a variant attribute value
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const { variantId, attributeValueId } = req.body;
    const variantAttributeValue = await VariantAttributeValue.findByPk(req.params.id);
    if (!variantAttributeValue) return res.status(404).json({ error: 'Variant Attribute Value not found' });

    variantAttributeValue.variantId = variantId || variantAttributeValue.variantId;
    variantAttributeValue.attributeValueId = attributeValueId || variantAttributeValue.attributeValueId;
    await variantAttributeValue.save();
    res.status(200).json(variantAttributeValue);
}));

// Delete a variant attribute value
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const variantAttributeValue = await VariantAttributeValue.findByPk(req.params.id);
    if (!variantAttributeValue) return res.status(404).json({ error: 'Variant Attribute Value not found' });
    await variantAttributeValue.destroy();
    res.status(204).end();
}));

module.exports = router;