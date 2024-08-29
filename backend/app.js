const express = require('express');
const winston = require('winston');
const cors = require('cors'); // Import cors package
const app = express();
const port = 4000;

// Import Sequelize model
const Log = require('./models/log');

// Import routes
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');

// Middleware to parse JSON bodies
app.use(express.json());

// Configure CORS to allow requests from specific origins
app.use(cors({
    origin: 'http://localhost:3000' // Allow this origin to make requests
}));

// Configure Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'user-actions.log' }),
        new winston.transports.Console(),
    ],
});

// Middleware to log user actions and save to database
app.use(async (req, res, next) => {
    const logEntry = {
        method: req.method,
        url: req.url,
        user_id: req.user ? req.user.id : 'anonymous', // Assuming you have user information in req.user
        timestamp: new Date(),
        body: req.body,
        query: req.query,
    };

    logger.info('User action', logEntry);

    // Save log entry to PostgreSQL database
    try {
        await Log.create(logEntry);
    } catch (error) {
        console.error('Failed to save log entry to database:', error);
    }

    next();
});

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
