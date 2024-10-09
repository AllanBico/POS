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
        type: DataTypes.DECIMAL(10, 2), // Changed from INTEGER to DECIMAL
        defaultValue: 0.00,
    },
    code: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    partNumber: {
        type: DataTypes.STRING,
        allowNull: true,
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
    if (amount <= 0) {
        throw new Error('Increment amount must be positive');
    }
    this.stockQuantity += amount; // Update the local stock quantity
    return await this.save({ transaction }); // Use save instead of update for better performance
};

Variant.prototype.decrementStock = async function (amount, transaction = null) {
    if (amount <= 0) {
        throw new Error('Decrement amount must be positive');
    }
    if (this.stockQuantity < amount) {
        throw new Error('Insufficient stock');
    }
    console.log('Decrementing stock by', amount);
    this.stockQuantity -= amount; // Update the local stock quantity
    console.log('New stock quantity:', this.stockQuantity);
    return await this.save({ transaction }); // Use save instead of update for better performance
};

module.exports = Variant;
