const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const SalesOrder = require('../sales/salesOrder');
const User = require("../users/user");

const DeliveryNote = sequelize.define('DeliveryNote', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    salesOrderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: SalesOrder,
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    deliveryDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    status: {
        type: DataTypes.ENUM('pending', 'delivered', 'failed','returned'),
        defaultValue: 'pending',
    },
    deliveryAddress: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    deliveryPerson: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
}, {
    timestamps: true,
    underscored: true,
});

module.exports = DeliveryNote;
