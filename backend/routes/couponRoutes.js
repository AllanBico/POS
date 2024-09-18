const express = require('express');
const router = express.Router();
const { Coupon } = require('../models/associations'); // Adjust the import path as necessary
const authenticateToken = require('../middleware/auth'); // Assuming you have authentication middleware

// Create a new coupon
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { code, discountType, discountValue, minimumPurchaseAmount, expiryDate, usageLimit, customerLimit, applicableTo, applicableId, customerRestrictions, description, status } = req.body;
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
        res.status(201).json(coupon);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the coupon' });
    }
});

// Get all coupons
router.get('/', authenticateToken, async (req, res) => {
    try {
        const coupons = await Coupon.findAll();
        res.status(200).json(coupons);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching coupons' });
    }
});

// Get a single coupon by ID
router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const coupon = await Coupon.findByPk(id);
        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }
        res.status(200).json(coupon);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the coupon' });
    }
});

// Update a coupon by ID
router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { code, discountType, discountValue, minimumPurchaseAmount, expiryDate, usageLimit, customerLimit, applicableTo, applicableId, customerRestrictions, description, status } = req.body;
    try {
        const coupon = await Coupon.findByPk(id);
        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }
        await coupon.update({
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
            status
        });
        res.status(200).json(coupon);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while updating the coupon' });
    }
});

// Delete a coupon by ID
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const coupon = await Coupon.findByPk(id);
        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }
        await coupon.destroy();
        res.status(204).send(); // No content
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while deleting the coupon' });
    }
});

module.exports = router;
