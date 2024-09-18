const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Variant = require('../product/variant');
const Warehouse = require('../warehouse');
const Store = require('../store');

const StockTake = sequelize.define('StockTake', {
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
    },
    warehouseId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Warehouse,
            key: 'id',
        },
    },
    systemQuantity: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    physicalQuantity: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    difference: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending',
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },

}, {
    timestamps: true,
    underscored: true,
});

module.exports = StockTake;
