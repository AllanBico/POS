// models/RolePermission.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const RolePermission = sequelize.define('RolePermission', {
    roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Roles', // Table name for Role model
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    permissionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Permissions', // Table name for Permission model
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
}, {
    tableName: 'role_permissions' ,// Ensure this matches your actual table name
    underscored: true,
});

module.exports = RolePermission;
