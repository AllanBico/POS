const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Product = require('./product');

const Variant = sequelize.define('Variant', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    sku: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    stockQuantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    productId: {
        type: DataTypes.INTEGER,
        references: {
            model: Product,
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
}, {
    timestamps: true,
    paranoid: false,
    underscored: true,

});


// Add custom methods for stock management
Variant.prototype.incrementStock = async function (amount, transaction = null) {
    // Increment the stock quantity by a given amount
    return await this.update({ stockQuantity: this.stockQuantity + amount }, { transaction });
};

Variant.prototype.decrementStock = async function (amount, transaction = null) {
    // Ensure you don't allow stock to go below zero
    if (this.stockQuantity - amount < 0) {
        throw new Error('Insufficient stock');
    }
    return await this.update({ stockQuantity: this.stockQuantity - amount }, { transaction });
};

module.exports = Variant;
