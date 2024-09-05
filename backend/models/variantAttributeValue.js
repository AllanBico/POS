const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Adjust the path as necessary

const VariantAttributeValue = sequelize.define('VariantAttributeValue', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    variantId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'productVariants',
            key: 'id',
        },
    },
    attributeValueId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'attributeValues',
            key: 'id',
        },
    },
}, {
    timestamps: true,
    paranoid: false,
    underscored: true,
});

module.exports = VariantAttributeValue;
