const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Adjust the path as necessary

const ProductVariant = sequelize.define('ProductVariant', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    productId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Products',
            key: 'id',
        },
    },
    priceOverride: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    sku: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    stockQuantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    timestamps: true,
    paranoid: false,
    underscored: true,
});

module.exports = ProductVariant;
