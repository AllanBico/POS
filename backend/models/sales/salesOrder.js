const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db'); // Import your database connection
const Customer = require('../customer')
const User = require('../users/user')
const PaymentMethod = require('../PaymentMethod')

const SalesOrder = sequelize.define('SalesOrder', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    customerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Customer,
            key: 'id',
        },
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User, // Name of the User model
            key: 'id',
        },
    },
    status: {
        type: DataTypes.ENUM('draft', 'completed', 'canceled'),
        defaultValue: 'draft',
        allowNull: false,
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    discount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    taxAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    discountType: {
        type: DataTypes.ENUM('fixed', 'percentage'),
        allowNull: false,
        defaultValue: 'fixed',
    },
    netTotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    paymentMethodId: {
        type: DataTypes.INTEGER,
        references: {
            model: PaymentMethod, // Name of the PaymentMethod model
            key: 'id',
        },
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
    tableName: 'sales_orders',
    timestamps: true,
    underscored: true,
});

module.exports = SalesOrder;
