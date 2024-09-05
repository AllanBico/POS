const express = require('express');
const  AttributeValue  = require('../models/attributeValue');

const router = express.Router();
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
// Create AttributeValue
router.post('/', asyncHandler(async (req, res) => {

    const { value, attributeId } = req.body;
    console.log("value, attributeId",value, attributeId)
    const attributeValue = await AttributeValue.create({ value, attributeId });
    res.status(201).json(attributeValue);
    req.io.emit('newAttributeValue', attributeValue);
}));

// Get All AttributeValues
router.get('/', asyncHandler(async (req, res) => {
    const attributeValues = await AttributeValue.findAll();
    res.json(attributeValues);
}));

// Get Single AttributeValue by ID
router.get('/:id', asyncHandler(async (req, res) => {
    const attributeValue = await AttributeValue.findByPk(req.params.id);
    if (!attributeValue) return res.status(404).json({ error: 'AttributeValue not found' });
    res.json(attributeValue);
}));

// Update AttributeValue by ID
router.put('/:id', asyncHandler(async (req, res) => {
    const { value, attributeId } = req.body;
    const attributeValue = await AttributeValue.findByPk(req.params.id);
    if (!attributeValue) return res.status(404).json({ error: 'AttributeValue not found' });

    attributeValue.value = value || attributeValue.value;
    attributeValue.attributeId = attributeId || attributeValue.attributeId;
    await attributeValue.save();
    const updatedAttributeValue = await AttributeValue.findByPk(req.params.id);
    res.json(updatedAttributeValue);
    req.io.emit('updateAttributeValue', updatedAttributeValue);
}));

// Delete AttributeValue by ID
router.delete('/:id', asyncHandler(async (req, res) => {
    const id = req.params.id
    const attributeValue = await AttributeValue.findByPk(id);
    if (!attributeValue) return res.status(404).json({ error: 'AttributeValue not found' });

    await attributeValue.destroy();
    res.status(204).end();
    req.io.emit('deleteAttributeValue', id);
}));

module.exports = router;
