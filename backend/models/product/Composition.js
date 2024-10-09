const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Variant = require('./variant');

const Composition = sequelize.define('Composition', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
        productVariantId: {
        type: DataTypes.INTEGER,
        references: {
            model: Variant,
            key: 'id',
        },
        onDelete: 'CASCADE',
        allowNull: false,
    },
    ingredientVariantId: {
        type: DataTypes.INTEGER,
        references: {
            model: Variant,
            key: 'id',
        },
        onDelete: 'CASCADE',
        allowNull: false,
    },
    quantity: {
        type: DataTypes.FLOAT,
        allowNull: false,
    }
}, {
    timestamps: true,
    underscored: true,
});

// You can also add helper methods for ingredient consumption here if needed.

module.exports = Composition;
