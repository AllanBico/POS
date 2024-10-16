const express = require('express');
const { PriceRule,Variant,Store,Warehouse,Customer } = require('../../models/associations');
const authenticateToken = require('../../middleware/auth');
const { ValidationError, Op } = require('sequelize');
const router = express.Router();

// Utility function to handle async routes
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Validate price rule input
const validatePriceRuleInput = (ruleType, adjustmentType, adjustmentValue, startTime, endTime, dailyStartTime, dailyEndTime, bundleWithVariantId, locationType, locationId, minQuantity, customerId) => {
    console.log('ruleType, adjustmentType, adjustmentValue, startTime, endTime, dailyStartTime, dailyEndTime, bundleWithVariantId, locationType, locationId, minQuantity, customerId',ruleType, adjustmentType, adjustmentValue, startTime, endTime, dailyStartTime, dailyEndTime, bundleWithVariantId, locationType, locationId, minQuantity, customerId)
    if (ruleType !== null && (typeof ruleType !== 'string' || !['time', 'bundle', 'location', 'quantity', 'customer'].includes(ruleType))) {
        const error = new Error('Valid rule type is required (time, bundle, location, quantity, customer)');
        error.status = 400;
        return error;
    }
    if (adjustmentType !== null && (typeof adjustmentType !== 'string' || !['percentage', 'fixed'].includes(adjustmentType))) {
        const error = new Error('Valid adjustment type is required (percentage or fixed)');
        error.status = 400;
        return error;
    }
    if (adjustmentValue !== null && (typeof adjustmentValue !== 'number' || adjustmentValue <= 0)) {
        const error = new Error('Valid adjustment value is required (greater than 0)');
        error.status = 400;
        return error;
    }
    // if (startTime !== null && typeof startTime !== 'string') {
    //     const error = new Error('Start time must be a valid string');
    //     error.status = 400;
    //     return error;
    // }
    // if (endTime !== null && typeof endTime !== 'string') {
    //     const error = new Error('End time must be a valid string');
    //     error.status = 400;
    //     return error;
    // }
    // if (dailyStartTime !== null && typeof dailyStartTime !== 'string') {
    //     const error = new Error('Daily start time must be a valid string');
    //     error.status = 400;
    //     return error;
    // }
    // if (dailyEndTime !== null && typeof dailyEndTime !== 'string') {
    //     const error = new Error('Daily end time must be a valid string');
    //     error.status = 400;
    //     return error;
    // }
    // if (bundleWithVariantId !== null && typeof bundleWithVariantId !== 'number') {
    //     const error = new Error('Bundle with variant ID must be a valid number');
    //     error.status = 400;
    //     return error;
    // }
    // if (locationType !== null && (typeof locationType !== 'string' || !['store', 'warehouse'].includes(locationType))) {
    //     const error = new Error('Valid location type is required (store or warehouse)');
    //     error.status = 400;
    //     return error;
    // }
    // if (locationId !== null && typeof locationId !== 'number') {
    //     const error = new Error('Location ID must be a valid number');
    //     error.status = 400;
    //     return error;
    // }
    // if (minQuantity !== null && typeof minQuantity !== 'number') {
    //     const error = new Error('Minimum quantity must be a valid number');
    //     error.status = 400;
    //     return error;
    // }
    // if (customerId !== null && typeof customerId !== 'number') {
    //     const error = new Error('Customer ID must be a valid number');
    //     error.status = 400;
    //     return error;
    // }
};


// Check for duplicate price rule name
const checkDuplicateName = async (req,id = null) => {
    console.log('req',req.body)
    const whereClause = {
        // Only include fields if they are not null
        ...(req.body.ruleType !== null && { ruleType: req.body.ruleType }),
        ...(req.body.adjustmentType !== null && { adjustmentType: req.body.adjustmentType }),
        ...(req.body.adjustmentValue !== null && { adjustmentValue: req.body.adjustmentValue }),
        ...(req.body.startTime !== null && { startTime: req.body.startTime }),
        ...(req.body.endTime !== null && { endTime: req.body.endTime }),
        ...(req.body.dailyStartTime !== null && { dailyStartTime: req.body.dailyStartTime }),
        ...(req.body.dailyEndTime !== null && { dailyEndTime: req.body.dailyEndTime }),
        ...(req.body.bundleWithVariantId !== null && { bundleWithVariantId: req.body.bundleWithVariantId }),
        ...(req.body.locationType !== null && { locationType: req.body.locationType }),
        ...(req.body.locationId !== null && { locationId: req.body.locationId }),
        ...(req.body.minQuantity !== null && { minQuantity: req.body.minQuantity }),
        ...(req.body.customerId !== null && { customerId: req.body.customerId }),
        ...(req.body.variantId !== null && { variantId: req.body.variantId })
    };
    if (id) {
        whereClause.id = { [Op.ne]: id };
    }
    const existingPriceRule = await PriceRule.findOne({ where: whereClause });
    return !!existingPriceRule; // Return true if a duplicate exists, false otherwise
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

router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { ruleType, adjustmentType, adjustmentValue, startTime, endTime, dailyStartTime, dailyEndTime, bundleWithVariantId, locationType, locationId, minQuantity, customerId, variantId } = req.body;
        console.log('1')
        const validationError = validatePriceRuleInput(ruleType, adjustmentType, adjustmentValue, startTime, endTime, dailyStartTime, dailyEndTime, bundleWithVariantId, locationType, locationId, minQuantity, customerId);
        if (validationError) {
            return res.status(400).json({ message: validationError.message });
        }
        console.log('2')
        const isDuplicate = await checkDuplicateName(req); // Check for duplicate
        if (isDuplicate) {
            return res.status(400).json({ message: 'Price rule with this details already exists' });
        }
        console.log('Creating price rule:', { ruleType, adjustmentType, adjustmentValue, startTime, endTime, dailyStartTime, dailyEndTime, bundleWithVariantId, locationType, locationId, minQuantity, customerId, variantId }); // Log for debugging
        const priceRule = await PriceRule.create({ ruleType, adjustmentType, adjustmentValue, startTime, endTime, dailyStartTime, dailyEndTime, bundleWithVariantId, locationType, locationId, minQuantity, customerId, variantId }, {
            include: [
                {model: Variant, as: 'bundleVariant'},
                { model: Variant, as: 'variant' },
                { model: Store, as: 'store' },
                { model: Warehouse, as: 'warehouse' },
                { model: Customer, as: 'customer' },
            ],
        });
        res.status(201).json({ data: { value: priceRule }, message: 'Price rule created successfully' }); // Added message field
        emitToOthers(req, 'newPriceRule', priceRule);
    } catch (error) {
        if (error.status === 400) {
            res.status(400).json({ message: error.message });
        } else {
            throw error;
        }
    }
}));

// Get all price rules
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const priceRules = await PriceRule.findAll({
            include: [
                {model: Variant, as: 'bundleVariant'},
                {model: Variant, as: 'bundleVariant'},
                { model: Variant, as: 'variant' },
                { model: Store, as: 'store' },
                { model: Warehouse, as: 'warehouse' },
                { model: Customer, as: 'customer' },
                
            ],
        });
        res.status(200).json({ data: { value: priceRules }, message: 'Price rules fetched successfully' }); // Changed response structure
        
    } catch (error) {
        console.error('Error fetching price rules:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Get a single price rule by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid price rule ID' });
        }

        const priceRule = await PriceRule.findByPk(id, {
            include: [
                {model: Variant, as: 'bundleVariant'},
                { model: Variant, as: 'variant' },
                { model: Store, as: 'store' },
                { model: Warehouse, as: 'warehouse' },
                { model: Customer, as: 'customer' },
            ],
        });
        if (!priceRule) {
            return res.status(404).json({ message: 'Price rule not found' });
        }
        res.status(200).json({ data: { value: priceRule }, message: 'Price rule fetched successfully' }); // Changed response structure
    } catch (error) {
        console.error('Error fetching price rule:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Update a price rule by ID
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { ruleType, adjustmentType, adjustmentValue, startTime, endTime, dailyStartTime, dailyEndTime, bundleWithVariantId, locationType, locationId, minQuantity, customerId, variantId } = req.body;
        const id = parseInt(req.params.id, 10);
        console.log('id',id)
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid price rule ID' });
        }

        const validationError = validatePriceRuleInput(ruleType, adjustmentType, adjustmentValue, startTime, endTime, dailyStartTime, dailyEndTime, bundleWithVariantId, locationType, locationId, minQuantity, customerId);
        if (validationError) {
            return res.status(400).json({ message: validationError.message });
        }
        const isDuplicate = await checkDuplicateName(req, id); // Check for duplicate
        if (isDuplicate) {
            return res.status(400).json({ message: 'Price rule with this details already exists' });
        }

        console.log('Updating price rule:', { id, ruleType, adjustmentType, adjustmentValue, startTime, endTime, dailyStartTime, dailyEndTime, bundleWithVariantId, locationType, locationId, minQuantity, customerId, variantId }); // Log for debugging

        const priceRule = await PriceRule.update({ ruleType, adjustmentType, adjustmentValue, startTime, endTime, dailyStartTime, dailyEndTime, bundleWithVariantId, locationType, locationId, minQuantity, customerId, variantId }, { where: { id } }, {
            include: [
                {model: Variant, as: 'bundleVariant'},
                { model: Variant, as: 'variant' },
                { model: Store, as: 'store' },
                { model: Warehouse, as: 'warehouse' },
                { model: Customer, as: 'customer' },
            ],
        });
        if (priceRule[0] === 0) {
            return res.status(404).json({ message: 'Price rule not found' });
        }
        const updatedPriceRule = await PriceRule.findByPk(id, {
            include: [
                {model: Variant, as: 'bundleVariant'},
                { model: Variant, as: 'variant' },
                { model: Store, as: 'store' },
                { model: Warehouse, as: 'warehouse' },
                { model: Customer, as: 'customer' },
            ],
        });
        console.log('priceRule',updatedPriceRule)
        res.status(200).json({ data: { value: updatedPriceRule }, message: 'Price rule updated successfully' }); // Added message field
        emitToOthers(req, 'updatePriceRule', updatedPriceRule);
    } catch (error) {
        if (error.status === 400) {
            res.status(400).json({ message: error.message });
        } else {
            throw error;
        }
    }
}));

// Delete a price rule by ID
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid price rule ID' });
        }

        const deletedRowsCount = await PriceRule.destroy({ where: { id } });
        if (deletedRowsCount === 0) {
            return res.status(404).json({ message: 'Price rule not found' });
        }

        res.status(200).json({ message: 'Price rule deleted successfully' });
        emitToOthers(req, 'deletePriceRule', id);
    } catch (error) {
        console.error('Error deleting price rule:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
// Get all price rules for a specific variant
router.get('/variant/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const variantId = parseInt(req.params.id, 10);
        console.log("variantId",req.params.id)
        if (isNaN(variantId)) {
            return res.status(400).json({ message: 'Invalid variant ID' });
        }

        const priceRules = await PriceRule.findAll({ where: { variantId },
            include: [
                {model: Variant, as: 'bundleVariant'},
                { model: Variant, as: 'variant' },
                { model: Store, as: 'store' },
                { model: Warehouse, as: 'warehouse' },
                { model: Customer, as: 'customer' },
            ],
        });
        res.status(200).json({ data: priceRules });
    } catch (error) {
        console.error('Error getting price rules:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Error handling middleware
router.use(handleError);

module.exports = router;
