const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const User = require("../users/user");

const Coupon = sequelize.define('Coupon', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    discountType: {
        type: DataTypes.ENUM('percentage', 'fixed_amount', 'buy_x_get_y'),
        allowNull: false,
    },
    discountValue: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    minimumPurchaseAmount: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    expiryDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    usageLimit: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    customerLimit: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    applicableTo: {
        type: DataTypes.ENUM('product', 'variant', 'category', 'subcategory'),
        allowNull: true,
    },
    applicableId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    customerRestrictions: {
        type: DataTypes.JSON, // List of customer IDs or groups
        allowNull: true,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('active', 'expired', 'disabled'),
        defaultValue: 'active',
    },
    usageCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
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
}, {
    timestamps: true,
    underscored: true,

});

module.exports = Coupon;
