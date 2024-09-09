
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
// Define the Brand model using Sequelize
const Brand = sequelize.define('Brand', {
    // id is an auto-incrementing primary key
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    // name is a required string field that must be unique
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    // description is an optional text field
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    // include timestamps (created_at, updated_at, deleted_at)
    timestamps: true,
    // don't use paranoid mode (which would automatically set deleted_at when a record is deleted)
    paranoid: false,
    // use underscored column names (e.g. created_at instead of createdAt)
    underscored: true,
});

// make the Brand model available to other parts of the application
module.exports = Brand;