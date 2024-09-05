// models/supplier.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Adjust the path as necessary

const Supplier = sequelize.define('Supplier', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    contact: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active',
    },
}, {
    timestamps: true,
    paranoid: false,
    underscored: true,
});

module.exports = Supplier;
