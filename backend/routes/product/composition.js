const express = require('express');
const { Composition, Variant, Product, Unit } = require('../../models/associations');
const authenticateToken = require('../../middleware/auth');
const { ValidationError, Op } = require('sequelize');
const router = express.Router();

// Utility function to handle async routes
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Validate composition input
const validateCompositionInput = (productVariantId, ingredients) => {
    if (!productVariantId || !Array.isArray(ingredients)) {
        const error = new Error('Valid productVariantId and ingredients array are required');
        error.status = 400;
        return error;
    }
    if (ingredients.some(ingredient => !ingredient.ingredientVariantId || !ingredient.quantity)) {
        const error = new Error('Invalid ingredient data');
        error.status = 400;
        return error;
    }
};

// Check for duplicate composition
const checkDuplicateComposition = async (productVariantId, ingredientVariantId) => {
    const existingComposition = await Composition.findOne({
        where: {
            productVariantId,
            ingredientVariantId
        }
    });
    return !!existingComposition; // Return true if a duplicate exists, false otherwise
};

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
    console.log("req.body", req.body);
    try {
        const { productVariantId, ingredients } = req.body;
        console.log("productVariantId, ingredients", productVariantId, ingredients); // Added logging for debugging
        const error = validateCompositionInput(productVariantId, ingredients);
        if (error) {
            return res.status(error.status).json({ message: error.message });
        }

        // Create compositions for each ingredient
        const compositions = await Promise.all(
            ingredients.map(async (ingredient) => {
                const { ingredientVariantId, quantity } = ingredient;
                console.log("ingredientVariantId, quantity", ingredientVariantId, quantity); // Added logging for debugging
                const isDuplicate = await checkDuplicateComposition(productVariantId, ingredientVariantId);
                if (isDuplicate) {
                    return res.status(400).json({ message: 'Composition with this ingredient already exists for this product variant' });
                }
                return await Composition.create({
                    productVariantId,
                    ingredientVariantId,
                    quantity,
                });
            })
        );

        console.log("compositions", compositions); // Added logging for debugging
        // Fetch compositions with details
        const detailedCompositions = await Composition.findAll({
            where: {
                id: {
                    [Op.in]: compositions.map(composition => composition.id)
                }
            },
            include: [
                {
                    model: Variant,
                    as: 'productVariant',
                    include: [
                        {
                            model: Product,
                            as: 'Product', // Specify the alias here
                            attributes: ['id', 'name', 'description']
                        }
                    ]
                },
                {
                    model: Variant,
                    as: 'ingredientVariant',
                    include: [
                        {
                            model: Product,
                            as: 'Product', // Specify the alias here
                            attributes: ['id', 'name', 'description']
                        }
                    ]
                }
            ]
        });
        res.status(201).json({ data: { value: detailedCompositions.map(composition => composition.get({ plain: true })) }, message: 'Composition created successfully' });
        emitToOthers(req, 'newComposition', detailedCompositions.map(composition => composition.get({ plain: true })));
    } catch (error) {
        if (error.status === 400) {
            res.status(400).json({ message: error.message });
        } else {
            throw error;
        }
    }
}));

// Get All Compositions
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const compositions = await Composition.findAll({
            include: [
                {
                    model: Variant,
                    as: 'productVariant',
                    include: [
                        {
                            model: Product,
                            attributes: ['id', 'name', 'description']
                        }
                    ]
                },
                {
                    model: Variant,
                    as: 'ingredientVariant',
                    include: [
                        {
                            model: Product,
                            attributes: ['id', 'name', 'description']
                        }
                    ]
                }
            ]
        });
        res.status(200).json({ data: { value: compositions }, message: 'Compositions fetched successfully' });
    } catch (error) {
        console.error('Error fetching compositions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Get Composition by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid composition ID' });
        }

        const composition = await Composition.findByPk(id, {
            include: [
                { model: Variant, as: 'productVariant' },
                { model: Variant, as: 'ingredientVariant' }
            ]
        });
        if (!composition) {
            return res.status(404).json({ message: 'Composition not found' });
        }
        res.status(200).json({ data: { value: composition }, message: 'Composition fetched successfully' });
    } catch (error) {
        console.error('Error fetching composition:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Update Composition
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { quantity } = req.body;
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid composition ID' });
        }

        const composition = await Composition.findByPk(id);
        if (!composition) {
            return res.status(404).json({ message: 'Composition not found' });
        }

        await composition.update({
            quantity,
        });

        res.status(200).json({ data: { value: composition }, message: 'Composition updated successfully' });
        emitToOthers(req, 'updateComposition', composition);
    } catch (error) {
        if (error.status === 400) {
            res.status(400).json({ message: error.message });
        } else {
            console.error('Error updating composition:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}));

// Delete Composition
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid composition ID' });
        }

        const deletedRowsCount = await Composition.destroy({ where: { id } });
        if (deletedRowsCount === 0) {
            return res.status(404).json({ message: 'Composition not found' });
        }

        res.status(200).json({ message: 'Composition deleted successfully' });
        emitToOthers(req, 'deleteComposition', id);
    } catch (error) {
        console.error('Error deleting composition:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Get Compositions by Product Variant ID
router.get('/variant/:productVariantId', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { productVariantId } = req.params;

        if (!productVariantId || isNaN(productVariantId)) {
            return res.status(400).json({ message: 'Invalid product variant ID' });
        }

        const compositions = await Composition.findAll({
            where: { productVariantId },
            include: [
                {
                    model: Variant,
                    as: 'ingredientVariant',
                    include: [{ model: Product, as: 'Product', include: [{ model: Unit, as: 'Unit' }] }]
                }
            ]
        });

        res.status(200).json({ data: { value: compositions }, message: 'Compositions fetched successfully' });
    } catch (error) {
        console.error('Error fetching compositions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// Error handling middleware
router.use(handleError);

module.exports = router;
