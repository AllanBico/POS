const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/users/user'); // Adjust based on your database setup
const authMiddleware = require('../middleware/auth');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();


// Helper function to send error responses
const sendErrorResponse = (res, statusCode, message) => {
    res.status(statusCode).json({ error: message });
};

// Login route (public)
/**
 * Login route handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Input validation
    if (!validateLoginInput(email, password)) {
        return sendErrorResponse(res, 400, 'Invalid email or password format');
    }

    try {
        const user = await findUserByEmail(email);
        if (!user) {
            return sendErrorResponse(res, 400, 'Invalid credentials');
        }

        const isPasswordValid = await verifyPassword(password, user.password_hash);
        if (!isPasswordValid) {
            return sendErrorResponse(res, 400, 'Invalid credentials');
        }

        const token = generateAuthToken(user);
        sendSuccessResponse(res, token, user);
    } catch (error) {
        handleLoginError(error, res);
    }
});

// Helper functions for modularization and improved readability

/**
 * Validate login input
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {boolean} - True if input is valid, false otherwise
 */
function validateLoginInput(email, password) {
    return email && password && typeof email === 'string' && typeof password === 'string';
}

/**
 * Find user by email
 * @param {string} email - User's email
 * @returns {Promise<Object|null>} - User object if found, null otherwise
 */
async function findUserByEmail(email) {
    return await User.findOne({ where: { email } });
}

/**
 * Verify password
 * @param {string} password - Provided password
 * @param {string} hashedPassword - Stored hashed password
 * @returns {Promise<boolean>} - True if password is valid, false otherwise
 */
async function verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

/**
 * Generate authentication token
 * @param {Object} user - User object
 * @returns {string} - JWT token
 */
function generateAuthToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
}

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {string} token - JWT token
 * @param {Object} user - User object
 */
function sendSuccessResponse(res, token, user) {
    res.status(200).json({
        message: 'Login successful',
        token,
        user: {
            id: user.id,
            email: user.email,
        }
    });
}

/**
 * Handle login errors
 * @param {Error} error - Error object
 * @param {Object} res - Express response object
 */
function handleLoginError(error, res) {
    console.error('Error during login:', error);
    if (error instanceof jwt.JsonWebTokenError) {
        sendErrorResponse(res, 401, 'Failed to generate token');
    } else if (error.name === 'SequelizeConnectionError') {
        sendErrorResponse(res, 500, 'Database connection error');
    } else {
        sendErrorResponse(res, 500, 'An internal server error occurred');
    }
}

// Protected route (requires authentication)
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
