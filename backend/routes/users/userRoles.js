const express = require('express');
const router = express.Router();
const {UserRole} = require('../../models/associations');
const authenticateToken = require("../../middleware/auth");

// Assign a role to a user
router.post('/',authenticateToken, async (req, res) => {
    const { userId, roleId } = req.body;
    try {
        const userRole = await UserRole.create({ userId, roleId });
        res.json(userRole);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Remove a role from a user
router.delete('/',authenticateToken, async (req, res) => {
    const { userId, roleId } = req.body;
    try {
        const userRole = await UserRole.findOne({ where: { userId, roleId } });
        if (userRole) {
            await userRole.destroy();
            res.json({ message: 'Role removed from user' });
        } else {
            res.status(404).json({ error: 'UserRole not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;