// models/PriceRule.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Variant = require('../product/variant');
const Store = require('../store');
const Warehouse = require('../warehouse');
const Customer = require('../customer'); // Import the customer model if available

const PriceRule = sequelize.define('PriceRule', {
    variantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Variant,
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    ruleType: {
        type: DataTypes.ENUM('time', 'bundle', 'location', 'quantity', 'customer'),
        allowNull: false,
    },
    adjustmentType: {
        type: DataTypes.ENUM('percentage', 'fixed'),
        allowNull: false,
    },
    adjustmentValue: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    // For time-based rules
    startTime: {
        type: DataTypes.DATE,
        allowNull: true, // Specific start time for the rule
    },
    endTime: {
        type: DataTypes.DATE,
        allowNull: true, // Specific end time for the rule
    },
    dailyStartTime: {
        type: DataTypes.TIME,
        allowNull: true, // Daily start time if runDaily is true
    },
    dailyEndTime: {
        type: DataTypes.TIME,
        allowNull: true, // Daily end time if runDaily is true
    },
    // For bundle-based rules
    bundleWithVariantId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Variant,
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
    // For location-based rules
    locationType: {
        type: DataTypes.ENUM('store', 'warehouse'),
        allowNull: true,
    },
    locationId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    // For quantity-based rules
    minQuantity: {
        type: DataTypes.INTEGER,
        allowNull: true, // Minimum quantity for this rule to apply
    },
    // For customer-based rules
    customerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Customer, // Customer model
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
}, {
    timestamps: true,
    underscored: true,
});

module.exports = PriceRule;
