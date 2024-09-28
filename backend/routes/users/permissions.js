const express = require('express');
const router = express.Router();
const { Permission, Model, Variant, RolePermission} = require('../../models/associations'); // Ensure Model is imported
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
router.get('/roles-permissions/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const permissions = await RolePermission.findAll({where: { roleId: id }, attributes: ['permissionId']});
        const permissionIds = permissions.map(permission => permission.permissionId);
        console.log(`Roles permissions for role ${id}: ${permissionIds}`);
        res.json(permissionIds);
    } catch (err) {
        console.error(`Error fetching roles permissions for role ${id}: ${err.message}`);
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
    const role_id = parseInt(id)
    const { permissions } = req.body;
    try {
        console.log("permissions",permissions)
        console.log("id",typeof role_id)
        // Find all role permissions for the given role id
        const existingPermissions = await RolePermission.findAll({
            where: { roleId: role_id }
        });

        console.log("existingPermissions",existingPermissions)

        // Create a set of existing permission IDs for quick lookup
        const existingPermissionIds = new Set(existingPermissions.map(p => p.permissionId));

        console.log("existingPermissionIds",existingPermissionIds)

        // Update or create permissions
        for (const permissionId of permissions) {
            if (!existingPermissionIds.has(permissionId)) {
                console.log("role_id, permissionId",typeof role_id,typeof permissionId)
                await RolePermission.create({
                    roleId: role_id,  // Make sure role_id is correctly mapped in the model
                    permissionId: permissionId
                }, { raw: true });

            }
            existingPermissionIds.delete(permissionId);
        }

        // Remove permissions that are in the database but not in the new permissions list
        for (const permissionId of existingPermissionIds) {
            await RolePermission.destroy({
                where: {
                    roleId: role_id,
                    permissionId: permissionId
                }
            });
        }

        res.json({ message: 'Permissions updated successfully' });
    } catch (err) {
        console.log("err.message",err.message)
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
