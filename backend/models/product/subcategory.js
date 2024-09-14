// models/SubcategoryStore.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db'); // Adjust the path as necessary
const Category = require('./category');

const Subcategory = sequelize.define('Subcategory', {
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
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Category,
            key: 'id',
        },
    },
}, {
    timestamps: true,
    paranoid: false,
    underscored: true, // Enables snake_case column names like created_at
});

// Define associations


module.exports = Subcategory;
