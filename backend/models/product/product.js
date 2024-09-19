const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Category = require('./category');
const Subcategory = require('./subcategory');
const Brand = require('./brand'); // Import the Brand model
const Unit = require('./unit');
const Variant = require('./variant');
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
        onDelete: 'SET NULL',
    },
    subcategoryId: {
        type: DataTypes.INTEGER,
        references: {
            model: Subcategory,
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
    brandId: {
        type: DataTypes.INTEGER,
        references: {
            model: Brand, // Assuming the table name is 'brands'
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
    unitId: {
        type: DataTypes.INTEGER,
        references: {
            model: Unit,
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
        type: DataTypes.ENUM('inclusive', 'exclusive', 'exempted','zero rated'),
        allowNull: false,
        defaultValue: 'exclusive',
    },
}, {
    timestamps: true,
    paranoid: false,
    underscored: true,
});



module.exports = Product;
