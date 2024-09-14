const express = require('express');
const router = express.Router();
const {RolePermission} = require('../../models/associations');
const authenticateToken = require("../../middleware/auth");

// Assign a permission to a role
router.post('/',authenticateToken, async (req, res) => {
    const { roleId, permissionId } = req.body;
    try {
        const rolePermission = await RolePermission.create({ roleId, permissionId });
        res.json(rolePermission);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Remove a permission from a role
router.delete('/',authenticateToken, async (req, res) => {
    const { roleId, permissionId } = req.body;
    try {
        const rolePermission = await RolePermission.findOne({ where: { roleId, permissionId } });
        if (rolePermission) {
            await rolePermission.destroy();
            res.json({ message: 'Permission removed from role' });
        } else {
            res.status(404).json({ error: 'RolePermission not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;