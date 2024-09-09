const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Category = require('./Category');
const Subcategory = require('./Subcategory');
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

module.exports = Product;
