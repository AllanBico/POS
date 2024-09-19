// models/PurchaseOrderLineItem.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const PurchaseOrder = require('./purchaseOrder');
const Variant = require('../product/variant');

const PurchaseOrderLineItem = sequelize.define('PurchaseOrderLineItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    purchaseOrderId: {
        type: DataTypes.INTEGER,
        references: {
            model: PurchaseOrder,
            key: 'id',
        },
        allowNull: false,
        onDelete: 'CASCADE',
    },
    variantId: {
        type: DataTypes.INTEGER,
        references: {
            model: Variant,
            key: 'id',
        },
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
}, {
    timestamps: true,
    underscored: true,
});

module.exports = PurchaseOrderLineItem;
