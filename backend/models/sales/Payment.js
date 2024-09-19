const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db'); // Import your database connection
const SalesOrder = require('./salesOrder')
const PaymentMethod = require('../PaymentMethod')
const User = require("../users/user");

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    salesOrderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: SalesOrder,
            key: 'id',
        },
    },
    amountPaid: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    paymentMethodId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: PaymentMethod, // Name of the PaymentMethod model
            key: 'id',
        },
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed'),
        defaultValue: 'pending',
        allowNull: false,
    },
    transactionReference: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    paymentDate: {
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
}, {
    tableName: 'payments',
});

module.exports = Payment;
