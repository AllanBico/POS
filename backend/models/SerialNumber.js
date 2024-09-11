// models/SerialNumber.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Product = require('./Product');

const SerialNumber = sequelize.define('SerialNumber', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    serialNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    productId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'products',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    status: {
        type: DataTypes.ENUM('available', 'sold', 'returned','inactive'),
        defaultValue: 'available',
    },
}, {
    timestamps: true,
    underscored: true,
});



module.exports = SerialNumber;
