const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProductTax = sequelize.define('ProductTax', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    productId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'products',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    taxId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'taxes',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0, // Default priority if not specified
    },
}, {
    tableName: 'product_tax',
    timestamps: false,
    underscored: true,
});

module.exports = ProductTax;
