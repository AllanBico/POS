// models/Permission.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Model = require('../Model'); // Import the Model
const Permission = sequelize.define('Permission', {
    name: { type: DataTypes.STRING, allowNull: false },
    modelId: {
        type: DataTypes.INTEGER,
        references: {
            model: Model,
            key: 'id'
        },
        allowNull: false
    }
}, {
    tableName: 'permissions',
    underscored: true,// Ensure this matches your actual table name
});

module.exports = Permission;