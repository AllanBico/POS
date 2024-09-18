// routes/stockTakeRoutes.js
const express = require('express');
const { User,Warehouse,Store,StockTake,Variant,Inventory, Product, VariantAttributeValue, AttributeValue, Attribute, Category, Subcategory, Unit} = require('../models/associations');
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// Fetch all stock takes
router.get('/',authenticateToken, async (req, res) => {
    try {
        const stockTakes = await StockTake.findAll({
            include: [
                {
                    model: Variant,
                    as: 'variant',
                    attributes: ['id', 'sku', 'price'],
                    include: [
                        {
                            model: Product,
                            as: 'Product',
                            attributes: ['id', 'name'],
                            include: [
                                {
                                    model: Unit,
                                    as: 'Unit',
                                    attributes: ['abbreviation', 'name'],  // Include product name
                                }
                            ]// Include relevant attributes for Variant// Include product name
                        }
                    ]// Include relevant attributes for Variant
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name'],  // Include relevant attributes for Store
                },
                {
                    model: Store,
                    as: 'store',
                    attributes: ['id', 'name'],  // Include relevant attributes for Store
                },
                {
                    model: Warehouse,
                    as: 'warehouse',
                    attributes: ['id', 'name'],  // Include relevant attributes for Warehouse
                }
            ],
            attributes: ['id', 'variantId', 'storeId', 'warehouseId', 'systemQuantity', 'physicalQuantity', 'difference', 'date', 'status'],
            // Include StockTake fields
        });

        res.json(stockTakes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching stock takes' });
    }
});

// Create new stock take entry
router.post('/',authenticateToken, async (req, res) => {
    const stockTakeEntries = req.body;

    try {
        console.log('Incoming stock take entries:', stockTakeEntries);

        // Validate the incoming data
        if (!Array.isArray(stockTakeEntries) || stockTakeEntries.length === 0) {
            return res.status(400).json({ error: 'Invalid data format: expected a non-empty array' });
        }

        // Prepare entries with calculated status
        const processedEntries = stockTakeEntries.map(entry => {
            if (!entry.variantId || (entry.storeId === undefined && entry.warehouseId === undefined) ||
                entry.systemQuantity === undefined || entry.physicalQuantity === undefined) {
                throw new Error('Invalid entry format');
            }

            // Calculate the difference
            const difference = entry.systemQuantity - entry.physicalQuantity;

            // Set status based on difference
            entry.difference = difference;
            entry.createdBy = req.user.id;
            entry.status = difference === 0 ? 'completed' : 'pending';

            return entry;
        });

        // Insert stock take entries into the database
        await StockTake.bulkCreate(processedEntries, {
            validate: true, // Ensure data is validated before insertion
        });

        res.status(201).json({ message: 'Stock take entries created successfully' });
    } catch (error) {
        console.error(error);
        if (error.message === 'Invalid entry format') {
            res.status(400).json({ error: 'One or more stock take entries have invalid data format' });
        } else {
            res.status(500).json({ error: 'An error occurred while creating stock take entries' });
        }
    }
});

router.post('/products',authenticateToken, async (req, res) => {
    const { storeId, warehouse_id, category_id, subcategory_id } = req.body;

    // Define query filters for the products
    const productQuery = {};
    if (category_id) productQuery.category_id = category_id;
    if (subcategory_id) productQuery.subcategory_id = subcategory_id;

    try {
        // Step 1: Find all filtered products by category and subcategory
        const products = await Product.findAll({
            where: productQuery,
            attributes: ['id', 'name'],  // Fetch product IDs and names for grouping
        });

        // Step 2: Extract product IDs
        const productIds = products.map(product => product.id);

        // Step 3: Find all variants that belong to the filtered products
        const variants = await Variant.findAll({
            where: {
                productId: productIds  // Filter variants based on product IDs
            },
            attributes: ['id', 'sku', 'productId'],  // Fetch variant IDs, SKUs, and productId for grouping
        });

        // Step 4: Extract variant IDs
        const variantIds = variants.map(variant => variant.id);

        // Step 5: Find inventories filtered by store/warehouse and variant IDs
        const inventories = await Inventory.findAll({
            where: {
                variantId: variantIds,
                ...(storeId && { storeId }),  // Filter by store if provided
                ...(warehouse_id && { warehouseId: warehouse_id })  // Filter by warehouse if provided
            },
            include: [
                {
                    model: Variant,
                    as: 'InventoryVariants',
                    attributes: ['id', 'sku', 'productId'],  // Include necessary variant info
                    include: [
                        {
                            model: Product,
                            as: 'Product',
                            attributes: ['id', 'name'],  // Include product name
                        }
                    ]
                },
                {
                    model: Warehouse,
                    as: 'warehouse',
                    attributes: ['id', 'name'],  // Include Warehouse details
                },
                {
                    model: Store,
                    as: 'store',
                    attributes: ['id', 'name'],  // Include Store details
                }
            ]
        });

        // Step 6: Group inventories by product
        const groupedProducts = {};
        inventories.forEach(inventory => {
            const productId = inventory.InventoryVariants.Product.id;
            if (!groupedProducts[productId]) {
                groupedProducts[productId] = {
                    product: inventory.InventoryVariants.Product,
                    variants: []
                };
            }
            groupedProducts[productId].variants.push({
                variant: inventory.InventoryVariants,
                inventory: {
                    quantity: inventory.quantity,
                    warehouse: inventory.warehouse,
                    store: inventory.store
                }
            });
        });

        // Step 7: Convert groupedProducts object into an array for easier handling
        const result = Object.values(groupedProducts);

        // Return grouped products with their variants and inventory
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching inventories' });
    }
});




// Update stock take
router.put('/:id',authenticateToken, async (req, res) => {
    const { physical_quantity } = req.body;
    const stockTake = await StockTake.findByPk(req.params.id);

    if (stockTake) {
        stockTake.physical_quantity = physical_quantity;
        stockTake.difference = stockTake.system_quantity - physical_quantity;
        stockTake.status = 'completed';
        await stockTake.save();
        res.json(stockTake);
    } else {
        res.status(404).json({ error: 'Stock take not found' });
    }
});

// Delete stock take
router.delete('/:id',authenticateToken, async (req, res) => {
    const stockTake = await StockTake.findByPk(req.params.id);

    if (stockTake) {
        await stockTake.destroy();
        res.json({ message: 'Stock take deleted' });
    } else {
        res.status(404).json({ error: 'Stock take not found' });
    }
});

module.exports = router;
