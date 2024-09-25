const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Variant = require('../product/variant');
const StockMovement = require('./StockMovement');

const SerialNumber = sequelize.define('SerialNumber', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    serialNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    variantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Variant,
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    stockMovementId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Optional because some serial numbers may not have a movement associated yet
        references: {
            model: StockMovement,
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
    status: {
        type: DataTypes.ENUM('available', 'reserved', 'sold', 'returned','inactive'),
        allowNull: false,
        defaultValue: 'available', // Set default status to 'available'
    }
}, {
    timestamps: true,
    underscored: true,
    softDelete: true,
});

module.exports = SerialNumber;
