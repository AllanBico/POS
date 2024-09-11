const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
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





module.exports = Variant;
