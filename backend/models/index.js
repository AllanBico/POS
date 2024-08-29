const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('postgres://postgres:root@localhost:5432/test');

// Define models
const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        field: 'created_at',
        defaultValue: Sequelize.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        field: 'updated_at',
        defaultValue: Sequelize.NOW
    }
}, {
    tableName: 'users', // Make sure this matches your actual table name
    timestamps: true, // Sequelize handles timestamps automatically
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

const Product = sequelize.define('Product', {
    name: DataTypes.STRING,
    price: DataTypes.FLOAT,
}, {
    tableName: 'products'  // Specify table name to match your database
});

module.exports = { sequelize, User, Product };
