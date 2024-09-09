const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Category = require('./Category');
const Subcategory = require('./Subcategory');
const Brand = require('./Brand'); // Import the Brand model
const Unit = require('./unit');
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
            model: 'categories',
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
    subcategoryId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'subcategories',
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
    brandId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'brands', // Assuming the table name is 'brands'
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
    unitId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'units',
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
    lowStockAlert: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    VATType: {
        type: DataTypes.ENUM('inclusive', 'exclusive', 'exempted'),
        allowNull: false,
        defaultValue: 'exclusive',
    },
}, {
    timestamps: true,
    paranoid: false,
    underscored: true,
});

Product.belongsTo(Category, { as: 'category', foreignKey: 'categoryId' });
Product.belongsTo(Subcategory, { as: 'subcategory', foreignKey: 'subcategoryId' });
Product.belongsTo(Brand, { as: 'brand', foreignKey: 'brandId' }); // Add association with Brand
Product.belongsTo(Brand, { as: 'Unit', foreignKey: 'unitId' }); // Add association with Unit

module.exports = Product;
