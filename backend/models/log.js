const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Adjust the path as necessary

const Log = sequelize.define('Log', {
    method: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
    },
    body: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
    query: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
}, {
    tableName: 'logs',
    timestamps: false,
});

module.exports = Log;
