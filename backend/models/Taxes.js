// models/Model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Model = sequelize.define('Taxes', {
    name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
},{
    tableName: 'taxes',
    underscored: true,// Ensure this matches your actual table name
});

module.exports = Model;
