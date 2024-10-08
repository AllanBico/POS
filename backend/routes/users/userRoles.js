const express = require('express');
const router = express.Router();
const { UserRole, RolePermission, Permission,Model} = require('../../models/associations'); // Assuming RolePermission is included in associations
const authenticateToken = require("../../middleware/auth");


// Assign a role to a user
router.post('/', authenticateToken, async (req, res) => {
    const { userId, roleId } = req.body;
    console.log("enterred")
    try {
        console.log(`Assigning role ${roleId} to user ${userId}`);
        const userRole = await UserRole.create({ userId: parseInt(userId), roleId: parseInt(roleId) });
        res.json(userRole);
    } catch (err) {
        console.error(`Error assigning role ${roleId} to user ${userId}: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

// Remove a role from a user
router.delete('/', authenticateToken, async (req, res) => {
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

// Get RoleId from UserId
router.get('/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;
    try {
        const userRole = await UserRole.findOne({ where: { userId } });
        if (userRole) {
            res.json({ roleId: userRole.roleId });
        } else {
            res.status(404).json({ error: 'UserRole not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all permissions for a user's role along with model names
router.get('/:userId/permissions', async (req, res) => {
    const { userId } = req.params;
    try {
        const userRole = await UserRole.findOne({ where: { userId } });
        if (userRole) {
            console.debug(`Fetching permissions for user ${userId} and role ${userRole.roleId}`);
            const rolePermissions = await RolePermission.findAll({
                where: { roleId: userRole.roleId },
                include: [
                    {
                        model: Permission,
                        attributes: ['name', 'model_id'],
                        include: [{ model: Model, attributes: ['name'], as: 'Model' }]
                    }
                ]
            });

            // Arrange permissions by model
            const permissionsByModel = rolePermissions.reduce((acc, rolePermission) => {
                const modelName = rolePermission.Permission.Model.name;
                if (!acc[modelName]) {
                    acc[modelName] = {
                        model: modelName,
                        permissions: []
                    };
                }
                acc[modelName].permissions.push({

                        name: rolePermission.Permission.name,
                        model_id: rolePermission.Permission.model_id,

                });
                return acc;
            }, {});

            res.json(Object.values(permissionsByModel));
        } else {
            res.status(404).json({ error: 'UserRole not found' });
        }
    } catch (err) {
        console.error(`Error fetching permissions for user ${userId} and role: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;