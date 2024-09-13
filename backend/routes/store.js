const express = require('express');
const router = express.Router();
const Store = require('../models/store');
const authenticateToken = require("../middleware/auth");

// Create a new store
router.post('/', authenticateToken, async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({error: 'Missing required fields'});
        }

        const store = await Store.create(req.body);
        res.status(201).json(store);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

// Get all stores
router.get('/', authenticateToken, async (req, res) => {
    try {
        const stores = await Store.findAll();
        if (!stores) {
            return res.status(404).json({error: 'No stores found'});
        }

        res.status(200).json(stores);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

// Get a specific store by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({error: 'Invalid store ID'});
        }

        const store = await Store.findByPk(id);
        if (!store) {
            return res.status(404).json({error: 'Store not found'});
        }

        res.status(200).json(store);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

// Update a store
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({error: 'Invalid store ID'});
        }

        if (!req.body) {
            return res.status(400).json({error: 'Missing required fields'});
        }

        const store = await Store.findByPk(id);
        if (!store) {
            return res.status(404).json({error: 'Store not found'});
        }

        await store.update(req.body);
        res.status(200).json(store);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

// Delete a store
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({error: 'Invalid store ID'});
        }

        const store = await Store.findByPk(id);
        if (!store) {
            return res.status(404).json({error: 'Store not found'});
        }

        await store.destroy();
        res.status(204).end();
    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

module.exports = router;