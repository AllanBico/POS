const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db'); // Adjust the path as necessary

const Unit = sequelize.define('Unit', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    abbreviation: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // Name of your users table
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
}, {
    timestamps: true,
    paranoid: true,
    underscored: true, // This will map `created_at`, `updated_at`, and `deleted_at` instead of camelCase
});

module.exports = Unit;
