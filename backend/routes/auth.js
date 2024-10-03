const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/users/user'); // Adjust based on your database setup
const authMiddleware = require('../middleware/auth');
const dotenv = require('dotenv');
const {refreshAccessToken, revokeToken, handleCallback, getAuthUri} = require("../utils/intuitOAuth");
const {handleMpesaCallback, initiateSTKPush, requestAccessToken} = require("../utils/mpesa");
const {Payment} = require("../models/associations");

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
router.get('/intuit', (req, res) => {
    try {
        const authUri = getAuthUri();
        res.redirect(authUri);  // Redirect the user to Intuit's OAuth screen
    } catch (error) {
        console.error('Error getting authorization URL:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// OAuth callback route to handle the response from Intuit
router.get('/intuit/callback', async (req, res) => {
    try {
        const token = await handleCallback(req.url);
        // You should save the token in your database at this point
        console.log('Access Token:', token);
        res.json({ message: 'OAuth completed successfully', token });
    } catch (error) {
        console.error('OAuth callback error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Route to revoke an access token
router.post('/intuit/revoke', async (req, res) => {
    const { accessToken } = req.body;
    try {
        const response = await revokeToken(accessToken);
        res.json({ message: 'Token revoked successfully', response });
    } catch (error) {
        console.error('Revoke token error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Route to refresh the access token
router.post('/intuit/refresh', async (req, res) => {
    try {
        const newToken = await refreshAccessToken();
        res.json({ message: 'Token refreshed successfully', newToken });
    } catch (error) {
        console.error('Token refresh error:', error.message);
        res.status(500).json({ error: error.message });
    }
});
router.get('/mpesa/auth', async (req, res) => {
    try {
        const tokenResponse = await requestAccessToken();
        res.json({
            message: 'M-Pesa OAuth token fetched successfully',
            token: tokenResponse
        });
    } catch (error) {
        console.error('Error fetching M-Pesa OAuth token:', error.message);
        res.status(500).json({ error: error.message });
    }
});
router.post('/mpesa/stkpush', async (req, res) => {
    // const { phoneNumber, amount, accountReference, transactionDesc } = req.body;
    const PHONE_NUMBER = '254725094787';
    const AMOUNT = 5;
    const ACCOUNT_REFERENCE = 'INTELLITECH LTD';
    const TRANSACTION_DESC = 'Order Payment';
    try {
        const response = await initiateSTKPush(PHONE_NUMBER, AMOUNT, ACCOUNT_REFERENCE, TRANSACTION_DESC);
        res.json({
            message: 'STK push initiated successfully',
            response
        });
    } catch (error) {
        console.error('Error initiating STK Push:', error.message);
        res.status(500).json({ error: error.message });
    }
});

router.post('/mpesa/callback', async (req, res) => {
    try {
        const callbackData = req.body.Body.stkCallback;

        console.log('M-Pesa Callback Data:', JSON.stringify(callbackData, null, 2));

        const resultCode = callbackData.ResultCode;
        const checkoutRequestID = callbackData.CheckoutRequestID;

        if (resultCode === 0) {
            // Payment successful
            const amount = callbackData.CallbackMetadata.Item.find(i => i.Name === 'Amount').Value;
            const mpesaReceiptNumber = callbackData.CallbackMetadata.Item.find(i => i.Name === 'MpesaReceiptNumber').Value;

            console.log(`Payment successful for Checkout Request ID ${checkoutRequestID}, Amount: ${amount}, Receipt: ${mpesaReceiptNumber}`);

            // Save payment details to the Payment model
            const payment = await Payment.create({
                salesOrderId: checkoutRequestID, // Assuming checkoutRequestID corresponds to salesOrderId
                amountPaid: amount,
                paymentMethodId: 1, // Replace with actual M-Pesa payment method ID
                status: 'completed',
                transactionReference: mpesaReceiptNumber,
                createdBy: 7 // Assuming you have user information in the request
            });

            console.log('Payment saved:', payment.toJSON());

            // Emit payment success event
            req.io.emit('paymentConfirmed', {
                checkoutRequestID,
                status: 'paid',
                resultCode,
                amount,
                receipt: mpesaReceiptNumber
            });
        } else {
            // Payment failed
            console.log(`Payment failed for Checkout Request ID ${checkoutRequestID}: ${callbackData.ResultDesc}`);
            
            // Save failed payment attempt
            await Payment.create({
                salesOrderId: checkoutRequestID,
                amountPaid: 0, // No amount paid for failed transactions
                paymentMethodId: 'MPESA_PAYMENT_METHOD_ID',
                status: 'failed',
                transactionReference: checkoutRequestID,
                createdBy: req.user.id
            });
        }

        // Acknowledge the callback to avoid retries
        res.status(200).json({ message: 'Callback processed successfully' });
    } catch (error) {
        console.error('Error handling M-Pesa callback:', error.message);
        res.status(500).json({ error: 'Failed to process M-Pesa callback' });
    }
});
module.exports = router;
