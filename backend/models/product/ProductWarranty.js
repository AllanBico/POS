const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const GoodsReceivedLineItem = require('../inventory/goodsReceivedLineItem');
const Warranty = require('./warranty'); // Assuming you have this model already

const ProductWarranty = sequelize.define('ProductWarranty', {
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
    warrantyTypeId: {
        type: DataTypes.INTEGER,
        references: {
            model: Warranty,
            key: 'id',
        },
        allowNull: false,
        onDelete: 'SET NULL',
    },
    warrantyStartDate: {
        type: DataTypes.DATE,
        allowNull: true, // Allow null values
    },
    warrantyEndDate: {
        type: DataTypes.DATE,
        allowNull: true, // Allow null values
    },
}, {
    timestamps: true,
    underscored: true,
});

module.exports = ProductWarranty;
