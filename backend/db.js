const pgp = require('pg-promise')();

// Create a new database connection instance
const db = pgp({
    user: 'postgres',
    host: 'localhost',
    database: 'test',
    password: 'root',
    port: 5432,  // Default PostgreSQL port
});

module.exports = db;
