// models/UserRole.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const UserRole = sequelize.define('UserRole', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users', // Table name for User model
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Roles', // Table name for Role model
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
}, {
    tableName: 'user_roles', // Ensure this matches your actual table name
    underscored: true,
});

module.exports = UserRole;
