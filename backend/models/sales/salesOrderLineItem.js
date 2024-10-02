const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db'); // Import your database connection
const SalesOrder = require('./salesOrder');
const Variant = require("../product/variant");

const SalesOrderLineItem = sequelize.define('SalesOrderLineItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    salesOrderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: SalesOrder, // Name of the SalesOrder model
            key: 'id',
        },
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
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
        },
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    discount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    discountType: {
        type: DataTypes.ENUM('fixed', 'percentage'),
        allowNull: false,
        defaultValue: 'fixed',
    },
    taxAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
}, {
    tableName: 'sales_order_line_items',
    underscored: true,
});

module.exports = SalesOrderLineItem;
