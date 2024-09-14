// models/Model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Model = sequelize.define('Model', {
    name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
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
    tableName: 'models',
    underscored: true,// Ensure this matches your actual table name
});

module.exports = Model;
