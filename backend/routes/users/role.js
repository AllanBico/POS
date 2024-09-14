// routes/role.js
const express = require('express');
const { Role, Permission } = require('../../models/associations');
const authenticateToken = require("../../middleware/auth");
const router = express.Router();

// Create a Role
router.post('/',authenticateToken, async (req, res) => {
    const { name } = req.body;

    if (!name) {
        console.log("Missing required field: name");
        return res.status(400).json({ error: 'Missing required field: name' });
    }

    try {
        const role = await Role.create({ name });
        res.status(201).json(role);
    } catch (error) {
        console.log("error",error.message)
        res.status(500).json({ error: error.message });
    }
});

// Get All Roles
router.get('/',authenticateToken, async (req, res) => {
    try {
        const roles = await Role.findAll({ include: Permission });
        res.json(roles);
    } catch (error) {
        res.status(500).json({ error: error });
    }
});

// Get Single Role
router.get('/:id',authenticateToken, async (req, res) => {
    try {
        const role = await Role.findByPk(req.params.id, { include: Permission });
        if (!role) return res.status(404).json({ message: 'Role not found' });
        res.json(role);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch role' });
    }
});

// Update a Role
router.put('/:id',authenticateToken, async (req, res) => {
    const { name } = req.body;
    try {
        const role = await Role.findByPk(req.params.id);
        if (!role) return res.status(404).json({ message: 'Role not found' });

        role.name = name;
        await role.save();
        res.json(role);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update role' });
    }
});

// Delete a Role
router.delete('/:id',authenticateToken, async (req, res) => {
    try {
        const role = await Role.findByPk(req.params.id);
        if (!role) return res.status(404).json({ message: 'Role not found' });

        await role.destroy();
        res.json({ message: 'Role deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete role' });
    }
});

module.exports = router;