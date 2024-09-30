// models/GoodsReceivedLineItem.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const GoodsReceivedNote = require('./goodsReceivedNote');
const Variant = require('../product/variant');

const GoodsReceivedLineItem = sequelize.define('GoodsReceivedLineItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    goodsReceivedId: {
        type: DataTypes.INTEGER,
        references: {
            model: GoodsReceivedNote,
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
    receivedQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('fully_received', 'partially_received'),
        defaultValue: 'fully_received',
    },
    batchNumber: {
        type: DataTypes.STRING,
        allowNull: true, // Used for non-serialized, batch-tracked items
    },
    note: {  // New column for additional notes
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    timestamps: true,
    underscored: true,
    hooks: {
        beforeCreate: (goodsReceivedLineItem, options) => {
            const datePart = new Date().toISOString().split('T')[0].replace(/-/g, '');
            const warehouseId = goodsReceivedLineItem.variantId || '00'; // Use a default value if null
            const randomSuffix = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
            goodsReceivedLineItem.batchNumber = `${datePart}-${warehouseId}-${randomSuffix}`;
        },
    },
});

module.exports = GoodsReceivedLineItem;
