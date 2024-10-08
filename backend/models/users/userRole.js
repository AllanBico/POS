// models/UserRole.js
const { DataTypes, Sequelize} = require('sequelize');
const sequelize = require('../../config/db');
const Users = require('./user');
const Roles = require('../users/Role');

const UserRole = sequelize.define('UserRole', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Users, // Table name for User model
            key: 'id',
        },
        onDelete: 'CASCADE',
        primaryKey: true, // Part of the composite primary key
    },
    roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Roles, // Table name for Role model
            key: 'id',
        },
        onDelete: 'CASCADE',
        primaryKey: true, // Part of the composite primary key
    },
    createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
        defaultValue: Sequelize.NOW
    }
}, {
    tableName: 'user_roles',
    underscored: true,
    timestamps: false, // No need for createdAt/updatedAt in a join table
});

module.exports = UserRole;
