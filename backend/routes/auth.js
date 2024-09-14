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
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return sendErrorResponse(res, 400, 'Email and password are required');
    }

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return sendErrorResponse(res, 400, 'User not found');
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return sendErrorResponse(res, 400, 'Invalid password');
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, user:user },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                // Include any other user information that might be useful
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        if (error instanceof jwt.JsonWebTokenError) {
            sendErrorResponse(res, 401, 'Failed to generate token');
        } else if (error.name === 'SequelizeConnectionError') {
            sendErrorResponse(res, 500, 'Database connection error');
        } else {
            sendErrorResponse(res, 500, 'An internal server error occurred');
        }
    }
});

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
