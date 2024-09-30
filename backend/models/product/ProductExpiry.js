const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const GoodsReceivedLineItem = require('../inventory/goodsReceivedLineItem');

const ProductExpiry = sequelize.define('ProductExpiry', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    goodsReceivedLineItemId: {
        type: DataTypes.INTEGER,
        references: {
            model: GoodsReceivedLineItem,
            key: 'id',
        },
        allowNull: false,
        onDelete: 'CASCADE',
    },
    expiryDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    timestamps: true,
    underscored: true,
});

module.exports = ProductExpiry;
