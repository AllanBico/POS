const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const DeliveryNote = require('./deliveryNote');
const SalesOrderLineItem = require('../sales/salesOrderLineItem');
const Variant = require('../product/variant');  // Import the Variant model

const DeliveryLineItem = sequelize.define('DeliveryLineItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    deliveryNoteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: DeliveryNote,
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    salesOrderLineItemId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Allow creating delivery line items without a sales order item
        references: {
            model: SalesOrderLineItem,
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
    variantId: {
        type: DataTypes.INTEGER,
        allowNull: false,  // Link each delivery item to a specific product variant
        references: {
            model: Variant,
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    description: {
        type: DataTypes.STRING, // Optional description for items not linked to sales orders
        allowNull: true,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    timestamps: true,
    underscored: true,
});

module.exports = DeliveryLineItem;
