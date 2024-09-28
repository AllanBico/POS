const express = require('express');
const router = express.Router();
const { Composition, Variant,Product, Unit} = require('../../models/associations');
const authenticateToken = require("../../middleware/auth"); // Ensure correct paths

// Create Composition
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { productVariantId, ingredients } = req.body;
        console.log("productVariantId, ingredients",productVariantId, ingredients)
        // Check if the required fields are present
        if (!productVariantId || !Array.isArray(ingredients)) {
            return res.status(400).json({ error: 'Invalid input data' });
        }

        // Validate ingredients data
        if (ingredients.some(ingredient => !ingredient.ingredientVariantId || !ingredient.quantity)) {
            return res.status(400).json({ error: 'Invalid ingredient data' });
        }

        // Create compositions for each ingredient
        const compositions = await Promise.all(
            ingredients.map(async (ingredient) => {
                const { ingredientVariantId, quantity } = ingredient;
                return await Composition.create({
                    productVariantId,
                    ingredientVariantId,
                    quantity,
                });
            })
        );

        res.status(201).json(compositions);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


// Get All Compositions
router.get('/', authenticateToken, async (req, res) => {
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
        res.status(200).json(compositions);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get Composition by ID
router.get('/:id',authenticateToken, async (req, res) => {
    try {
        const composition = await Composition.findByPk(req.params.id, {
            include: [
                { model: Variant, as: 'productVariant' },
                { model: Variant, as: 'ingredientVariant' }
            ]
        });
        if (!composition) return res.status(404).json({ error: 'Composition not found' });
        res.status(200).json(composition);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update Composition
router.put('/:id',authenticateToken, async (req, res) => {
    try {
        const {  quantity } = req.body;
        const composition = await Composition.findByPk(req.params.id);
        if (!composition) return res.status(404).json({ error: 'Composition not found' });

        await composition.update({
            quantity,
        });

        res.status(200).json(composition);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete Composition
router.delete('/:id',authenticateToken, async (req, res) => {
    try {
        const composition = await Composition.findByPk(req.params.id);
        if (!composition) return res.status(404).json({ error: 'Composition not found' });

        await composition.destroy();
        res.status(204).json();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Get Compositions by Product Variant ID
router.get('/variant/:productVariantId', authenticateToken, async (req, res) => {
    console.log('Entering /variant/:productVariantId route');
    try {
        const { productVariantId } = req.params;

        if (!productVariantId || isNaN(productVariantId)) {
            return res.status(400).json({ error: 'Invalid product variant ID' });
        }

        const compositions = await Composition.findAll({
            where: { productVariantId },
            include: [
                { 
                    model: Variant, 
                    as: 'ingredientVariant',
                    include: [{ model: Product, as: 'Product', include:[{model:Unit, as:'Unit'}] }]
                }
            ]
        });


        if (compositions.length === 0) {
            return res.status(200).json(compositions);
        }

        res.status(200).json(compositions);
    } catch (error) {
        res.status(500).json({ error: 'An unexpected error occurred' });
    }
});

module.exports = router;
