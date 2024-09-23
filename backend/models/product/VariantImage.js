// models/variantImage.js

const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Variant = require('./variant');

const VariantImage = sequelize.define('VariantImage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    variantId: {
        type: DataTypes.INTEGER,
        references: {
            model: Variant,
            key: 'id',
        },
        onDelete: 'CASCADE',
    }
}, {
    timestamps: true,
    underscored: true,
    paranoid: false,
});

module.exports = VariantImage;
