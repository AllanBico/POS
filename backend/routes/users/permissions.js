const express = require('express');
const router = express.Router();
const { Permission, Model, Variant} = require('../../models/associations'); // Ensure Model is imported
const authenticateToken = require("../../middleware/auth");

// Get all permissions
router.get('/', authenticateToken, async (req, res) => {
    try {
        const permissions = await Model.findAll({
            include: [{ model: Permission, as: 'Permission' }] // Include model details in the response
        });
        res.json(permissions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new permission
router.post('/', authenticateToken, async (req, res) => {
    const { name, modelId } = req.body; // Ensure modelId is provided
    try {
        // Validate modelId
        const modelExists = await Model.findByPk(modelId);
        if (!modelExists) {
            return res.status(400).json({ error: 'Model not found' });
        }

        const permission = await Permission.create({ name, modelId });
        res.json(permission);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update an existing permission
router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, modelId } = req.body; // Ensure modelId is provided
    try {
        const permission = await Permission.findByPk(id);
        if (permission) {
            // Validate modelId
            if (modelId) {
                const modelExists = await Model.findByPk(modelId);
                if (!modelExists) {
                    return res.status(400).json({ error: 'Model not found' });
                }
            }

            permission.name = name;
            if (modelId) {
                permission.modelId = modelId;
            }
            await permission.save();
            res.json(permission);
        } else {
            res.status(404).json({ error: 'Permission not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a permission
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const permission = await Permission.findByPk(id);
        if (permission) {
            await permission.destroy();
            res.json({ message: 'Permission deleted' });
        } else {
            res.status(404).json({ error: 'Permission not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
