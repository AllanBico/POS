const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Attribute = require('./attribute');

const AttributeValue = sequelize.define('AttributeValue', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    value: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    attributeId: {
        type: DataTypes.INTEGER,
        references: {
            model: Attribute,
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
}, {
    timestamps: true,
    paranoid: false,
    underscored: true,
});



module.exports = AttributeValue;
