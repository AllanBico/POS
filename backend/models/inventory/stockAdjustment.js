const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Variant = require('../product/variant');
const Warehouse = require('../warehouse');
const Store = require('../store');
const User = require('../users/user'); // Assuming you have a User model
const StockTake = require('./stockTake'); // Import StockTake model

const StockAdjustment = sequelize.define('StockAdjustment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
    storeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Store,
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
    warehouseId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Warehouse,
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
    stockTakeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: StockTake,
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
    adjustmentQuantity: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending',
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
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
    approvedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: User,
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
    type: {
        type: DataTypes.ENUM('stock in', 'stock out'),
        allowNull: false,
    },
    serialNumbers: {
        type: DataTypes.STRING, // Store serial numbers as a comma-separated string
        allowNull: true,       // Make it nullable if not required
    },
}, {
    timestamps: true,
    underscored: true,
});

module.exports = StockAdjustment;
