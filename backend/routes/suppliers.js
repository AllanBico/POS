// routes/suppliers.js
const express = require('express');
const router = express.Router();
const  Supplier  = require('../models/supplier');

const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Get all suppliers
router.get('/', asyncHandler(async (req, res) => {
    const suppliers = await Supplier.findAll();
    res.json(suppliers);
}));

// Get a supplier by ID
router.get('/:id', asyncHandler(async (req, res) => {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
    res.json(supplier);
}));

// Create a new supplier
router.post('/', asyncHandler(async (req, res) => {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
    req.io.emit('newSupplier', supplier);
}));

// Update a supplier
router.put('/:id', asyncHandler(async (req, res) => {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });

    await supplier.update(req.body);
    const updatedsupplier = await Supplier.findByPk(req.params.id);
    res.json(updatedsupplier);
    req.io.emit('updateSupplier', updatedsupplier);
}));

// Delete a supplier
router.delete('/:id', asyncHandler(async (req, res) => {
    const id = req.params.id
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });

    await supplier.destroy();
    res.status(204).send();
    req.io.emit('updateSupplier', id);
}));

module.exports = router;
