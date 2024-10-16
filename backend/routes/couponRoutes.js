const express = require('express');
const { Coupon } = require('../models/associations');
const authenticateToken = require('../middleware/auth');
const { ValidationError, Op } = require('sequelize');
const router = express.Router();

// Utility function to handle async routes
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Validate coupon input
const validateCouponInput = (code, discountType, discountValue, minimumPurchaseAmount, expiryDate, usageLimit, customerLimit, applicableTo, applicableId, customerRestrictions, description, status) => {
    if (!code || typeof code !== 'string' || code.trim() === '') {
        const error = new Error('Valid code is required');
        error.status = 400;
        return error;
    }
    // Add validation for other fields as needed
};

// Check for duplicate coupon code
const checkDuplicateCode = async (code, id = null) => {
    const whereClause = {
        code: { [Op.iLike]: code.toLowerCase() }
    };
    if (id) {
        whereClause.id = { [Op.ne]: id };
    }
    const existingCoupon = await Coupon.findOne({ where: whereClause });
    return !!existingCoupon;
};

// Emit socket event to all clients except the sender
const emitToOthers = (req, event, data) => {
    try {
        const socketId = req.headers['x-socket-id'];
        if (req.io && typeof req.io.emit === 'function') {
            req.io.emit(event, data, { except: socketId });
        }
    } catch (error) {
        console.error('Error emitting socket event:', error);
    }
};

// Middleware for handling 400 and 500 errors
const handleError = (err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        status: err.status || 500
    });
};

// Create a new coupon
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { code, discountType, discountValue, minimumPurchaseAmount, expiryDate, usageLimit, customerLimit, applicableTo, applicableId, customerRestrictions, description, status } = req.body;
        validateCouponInput(code, discountType, discountValue, minimumPurchaseAmount, expiryDate, usageLimit, customerLimit, applicableTo, applicableId, customerRestrictions, description, status);
        const isDuplicate = await checkDuplicateCode(code);
        if (isDuplicate) {
            return res.status(400).json({ message: 'Coupon with this code already exists' });
        }
        const coupon = await Coupon.create({
            code,
            discountType,
            discountValue,
            minimumPurchaseAmount,
            expiryDate,
            usageLimit,
            customerLimit,
            applicableTo,
            applicableId,
            customerRestrictions,
            description,
            status,
            createdBy: req.user.id,
        });
        res.status(201).json({ data: { value: coupon }, message: 'Coupon created successfully' });
        emitToOthers(req, 'newCoupon', coupon);
    } catch (error) {
        if (error.status === 400) {
            res.status(400).json({ message: error.message });
        } else {
            throw error;
        }
    }
}));

// Get all coupons
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const coupons = await Coupon.findAll();
        res.status(200).json({ data: { value: coupons }, message: 'Coupons fetched successfully' });
    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Get a single coupon by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid coupon ID' });
        }

        const coupon = await Coupon.findByPk(id);
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        res.status(200).json({ data: { value: coupon }, message: 'Coupon fetched successfully' });
    } catch (error) {
        console.error('Error fetching coupon:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Update a coupon by ID
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { code, discountType, discountValue, minimumPurchaseAmount, expiryDate, usageLimit, customerLimit, applicableTo, applicableId, customerRestrictions, description, status } = req.body;
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid coupon ID' });
        }

        validateCouponInput(code, discountType, discountValue, minimumPurchaseAmount, expiryDate, usageLimit, customerLimit, applicableTo, applicableId, customerRestrictions, description, status);
        const isDuplicate = await checkDuplicateCode(code, id);
        if (isDuplicate) {
            return res.status(400).json({ message: 'Coupon with this code already exists' });
        }

        const [updatedRowsCount, [updatedCoupon]] = await Coupon.update(
            { code, discountType, discountValue, minimumPurchaseAmount, expiryDate, usageLimit, customerLimit, applicableTo, applicableId, customerRestrictions, description, status },
            { where: { id }, returning: true }
        );

        if (updatedRowsCount === 0) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        res.status(200).json({ data: { value: updatedCoupon }, message: 'Coupon updated successfully' });
        emitToOthers(req, 'updateCoupon', updatedCoupon);
    } catch (error) {
        if (error.status === 400) {
            res.status(400).json({ message: error.message });
        } else {
            console.error('Error updating coupon:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}));

// Delete a coupon by ID
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid coupon ID' });
        }

        const deletedRowsCount = await Coupon.destroy({ where: { id } });
        if (deletedRowsCount === 0) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        res.status(200).json({ message: 'Coupon deleted successfully' });
        emitToOthers(req, 'deleteCoupon', id);
    } catch (error) {
        console.error('Error deleting coupon:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Check if a coupon is active and available
router.get('/check/:code', authenticateToken, asyncHandler(async (req, res) => {
    const { code } = req.params;
    try {
        const coupon = await Coupon.findOne({ where: { code } });
        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        const now = new Date();
        const isActive = coupon.status === 'active' && 
                         coupon.expiryDate > now &&
                         (coupon.usageLimit === null || coupon.usageCount < coupon.usageLimit);

        res.status(200).json({
            isActive,
            coupon: isActive ? coupon : null
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while checking the coupon' });
    }
}));

// Error handling middleware
router.use(handleError);

module.exports = router;
