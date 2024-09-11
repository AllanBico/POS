const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Variant = require('./Variant');

const StockMovement = sequelize.define('StockMovement', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    variantId: {
        type: DataTypes.INTEGER,
        references: {
            model: Variant,
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    transactionType: {
        type: DataTypes.STRING,
        allowNull: false,
        // e.g., 'Stock In (From Supplier)', 'Return from Client', etc.
    },
    sourceType: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    sourceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    destinationType: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    destinationId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    transactionDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    notes: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true,
    underscored: true,
});

module.exports = StockMovement;
