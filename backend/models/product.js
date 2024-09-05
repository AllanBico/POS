const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Adjust the path as necessary
const Category = require('./category');
const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    categoryId: {
        type: DataTypes.INTEGER,
        references: {
            model: Category,
            key: 'id',
        },
    },
    subcategoryId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'subcategories',
            key: 'id',
        },
    },
}, {
    timestamps: true,
    paranoid: false,
    underscored: true,
});

module.exports = Product;
