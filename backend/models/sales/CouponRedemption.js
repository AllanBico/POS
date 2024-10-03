const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Coupon = require('./Coupon');
const SalesOrder = require("./salesOrder"); // Import the Coupon model

const CouponRedemption = sequelize.define('CouponRedemption', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    couponId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Coupon,
            key: 'id',
        },
        onDelete: 'CASCADE', // When a coupon is deleted, remove its redemptions
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: SalesOrder,
            key: 'id',
        },
    },
    discountAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    redemptionDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW, // Set the default value to the current date
    },
    status: {
        type: DataTypes.ENUM('used', 'expired', 'refunded'),
        defaultValue: 'used',
    },
}, {
    timestamps: true,
    underscored: true,
});

module.exports = CouponRedemption;
