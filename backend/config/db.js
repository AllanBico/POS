const { Sequelize } = require('sequelize');

// Define the database connection URL
const databaseUrl = 'postgres://postgres:root@localhost:5432/test';

// Create a new Sequelize instance
const sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: console.log, // Set to false to disable logging
});

// Test the database connection
sequelize.authenticate()
    .then(() => console.log('Database connected...'))
    .catch(err => console.log('Error: ' + err));

module.exports = sequelize;