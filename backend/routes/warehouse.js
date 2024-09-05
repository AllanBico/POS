const express = require('express');
const router = express.Router();
const  Warehouse  = require('../models/warehouse');

// Create a new warehouse
router.post('/', async (req, res) => {
    try {
        const warehouse = await Warehouse.create(req.body);
        res.status(201).json(warehouse);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all warehouses
router.get('/', async (req, res) => {
    try {
        const warehouses = await Warehouse.findAll();
        res.status(200).json(warehouses);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get a specific warehouse by ID
router.get('/:id', async (req, res) => {
    try {
        const warehouse = await Warehouse.findByPk(req.params.id);
        if (!warehouse) return res.status(404).json({ error: 'Warehouse not found' });
        res.status(200).json(warehouse);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update a warehouse
router.put('/:id', async (req, res) => {
    try {
        const warehouse = await Warehouse.findByPk(req.params.id);
        if (!warehouse) return res.status(404).json({ error: 'Warehouse not found' });

        await warehouse.update(req.body);
        res.status(200).json(warehouse);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a warehouse
router.delete('/:id', async (req, res) => {
    try {
        const warehouse = await Warehouse.findByPk(req.params.id);
        if (!warehouse) return res.status(404).json({ error: 'Warehouse not found' });

        await warehouse.destroy();
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
