// models/Expense.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const ExpenseCategory = require('./ExpenseCategory');
const PaymentMethod = require('./PaymentMethod');
const User = require('./users/user'); // Assuming you have a User model
const Supplier = require('./product/supplier'); // Assuming you have a Supplier model

const Expense = sequelize.define('Expense', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    expenseCategoryId: {
        type: DataTypes.INTEGER,
        references: {
            model: ExpenseCategory,
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    referenceNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    paymentMethodId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'payment_methods',
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
    paidById: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
    supplierId: {
        type: DataTypes.INTEGER,
        references: {
            model: Supplier,
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
}, {
    timestamps: true,
    paranoid: false,
    underscored: true,
});

module.exports = Expense;
