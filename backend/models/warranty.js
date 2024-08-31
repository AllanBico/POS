const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Adjust the path as necessary

const Warranty = sequelize.define('Warranty', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "Duration in number of periods",
    },
    periods: {
        type: DataTypes.ENUM('days', 'months', 'years'),
        allowNull: false,
        comment: "The unit of the duration (days, months, years)",
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "True means active, False means inactive",
    },
}, {
    timestamps: true,
    paranoid: false,
    underscored: true, // This will map `created_at` instead of `createdAt`
});

module.exports = Warranty;
