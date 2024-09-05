const express = require('express');
const router = express.Router();
const Store = require('../models/store');

// Create a new store
router.post('/', async (req, res) => {
    try {
        const store = await Store.create(req.body);
        res.status(201).json(store);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

// Get all stores
router.get('/', async (req, res) => {
    try {
        const stores = await Store.findAll();
        res.status(200).json(stores);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

// Get a specific store by ID
router.get('/:id', async (req, res) => {
    try {
        const store = await Store.findByPk(req.params.id);
        if (!store) return res.status(404).json({error: 'Store not found'});
        res.status(200).json(store);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

// Update a store
router.put('/:id', async (req, res) => {
    try {
        const store = await Store.findByPk(req.params.id);
        if (!store) return res.status(404).json({error: 'Store not found'});

        await store.update(req.body);
        res.status(200).json(store);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

// Delete a store
router.delete('/:id', async (req, res) => {
    try {
        const store = await Store.findByPk(req.params.id);
        if (!store) return res.status(404).json({error: 'Store not found'});

        await store.destroy();
        res.status(204).end();
    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

module.exports = router;
