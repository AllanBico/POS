const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Variant = require('../product/variant');
const Warehouse = require('../warehouse');
const Store = require('../store');

const Inventory = sequelize.define('Inventory', {
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
    warehouseId: {
        type: DataTypes.INTEGER,
        allowNull: true, // This field is optional if the product is in a store instead
        references: {
            model: Warehouse,
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
    storeId: {
        type: DataTypes.INTEGER,
        allowNull: true, // This field is optional if the product is in a warehouse instead
        references: {
            model: Store,
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    minimumStock: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0, // This could be used for low-stock alerts
    },
    reorderPoint: {
        type: DataTypes.INTEGER,
        allowNull: true, // Helps in automatic reorder processes
    },
    costPrice: {
        type: DataTypes.FLOAT,
        allowNull: true, // The cost price per unit of the item
    },
}, {
    timestamps: true,
    paranoid: false,
    underscored: true,
});



module.exports = Inventory;
