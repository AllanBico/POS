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
}, {
    timestamps: true,
    underscored: true,
});

module.exports = GoodsReceivedLineItem;
