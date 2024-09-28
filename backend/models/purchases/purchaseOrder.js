// models/PurchaseOrder.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Supplier = require('../product/supplier');
const Warehouse = require('../warehouse');
const Store = require('../store');

const PurchaseOrder = sequelize.define('PurchaseOrder', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    supplierId: {
        type: DataTypes.INTEGER,
        references: {
            model: Supplier,
            key: 'id',
        },
        allowNull: false,
    },
    warehouseId: {
        type: DataTypes.INTEGER,
        references: {
            model: Warehouse,
            key: 'id',
        },
        allowNull: true,
    },
    storeId: {
        type: DataTypes.INTEGER,
        references: {
            model: Store,
            key: 'id',
        },
        allowNull: true,
    },
    orderDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    expectedDeliveryDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('pending', 'received', 'cancelled','ordered','partial'),
        defaultValue: 'pending',
    },
    totalAmount: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
}, {
    timestamps: true,
    underscored: true,
});

module.exports = PurchaseOrder;
