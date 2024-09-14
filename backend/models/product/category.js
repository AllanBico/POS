// models/CategoryStore.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db'); // Adjust the path as necessary

const Category = sequelize.define('Category', {
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
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    timestamps: true,
    paranoid: false,
    underscored: true, // This will map `created_at` instead of `createdAt`
});


module.exports = Category;
