// routes/suppliers.js
const express = require('express');
const router = express.Router();
const { Supplier } = require('../../models/associations');
const authenticateToken = require("../../middleware/auth");

const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Get all suppliers
router.get('/',authenticateToken, asyncHandler(async (req, res) => {
    const suppliers = await Supplier.findAll();
    res.json(suppliers);
}));

// Get a supplier by ID
router.get('/:id',authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: 'Missing supplier ID' });
    }

    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
        return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json(supplier);
}));

// Create a new supplier
router.post('/',authenticateToken, asyncHandler(async (req, res) => {
    const { body } = req;
    if (!body.name || !body.contact || !body.email ) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const supplier = await Supplier.create(body);
    res.status(201).json(supplier);
    req.io.emit('newSupplier', supplier);
}));

// Update a supplier
router.put('/:id',authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: 'Missing supplier ID' });
    }

    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
        return res.status(404).json({ error: 'Supplier not found' });
    }

    const { body } = req;
    if (!body.name || !body.contact || !body.email || !body.phone) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    await supplier.update(body);
    const updatedsupplier = await Supplier.findByPk(id);
    res.json(updatedsupplier);
    req.io.emit('updateSupplier', updatedsupplier);
}));

// Delete a supplier
router.delete('/:id',authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: 'Missing supplier ID' });
    }

    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
        return res.status(404).json({ error: 'Supplier not found' });
    }

    await supplier.destroy();
    res.status(204).send();
    req.io.emit('updateSupplier', id);
}));

module.exports = router;