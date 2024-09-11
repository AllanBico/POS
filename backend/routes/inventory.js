const express = require('express');
const router = express.Router();
const { Product, Variant, Category, Subcategory, Brand, Unit, Attribute, AttributeValue, Inventory,  VariantAttributeValue, Warehouse, Store } = require('../models/associations');


// Fetch all inventory records
router.get('/', async (req, res) => {
    try {
        // Find all inventory records including related models
        const inventories = await Inventory.findAll({
            include: [
                {
                    model: Variant,
                    as: 'InventoryVariants',
                    include: [
                        {
                            model: VariantAttributeValue,
                            as: 'variantAttributeValues',
                            include: [
                                {
                                    model: AttributeValue,
                                    as: 'AttributeValue',
                                    attributes: ['id', 'value'],
                                    include: [
                                        { model: Attribute, as: 'Attribute', attributes: ['id', 'name'] } // Include Attribute name
                                    ]
                                }
                            ]
                        },
                        {
                            model: Product,
                            as: 'Product',
                            include: [
                                { model: Category, as: 'category', attributes: ['id', 'name'] }, // Include Category name
                                { model: Subcategory, as: 'subcategory', attributes: ['id', 'name'] }, // Include Subcategory name
                                { model: Unit, as: 'Unit', attributes: ['id', 'name', 'abbreviation'] } // Include Unit with abbreviation
                            ]
                        }
                    ]
                },
                {
                    model: Warehouse,
                    as: 'Warehouse',
                    attributes: ['id', 'name'], // Include Warehouse name
                },
                {
                    model: Store,
                    as: 'Store',
                    attributes: ['id', 'name'], // Include Store name
                }
            ]
        });

        // Group by variantId
        const groupedData = inventories.reduce((acc, inventory) => {
            const variantId = inventory.variantId;

            // Find existing variant group
            let variantGroup = acc.find(group => group.variantId === variantId);

            if (!variantGroup) {
                // If group doesn't exist, create a new group
                variantGroup = {
                    variantId,
                    variant: inventory.InventoryVariants, // Include the variant details
                    inventories: [], // Start with an empty array for inventories
                };
                acc.push(variantGroup);
            }

            // Add current inventory entry (warehouse/store/quantity/etc.) to the group
            variantGroup.inventories.push({
                warehouse: inventory.Warehouse,
                store: inventory.Store,
                quantity: inventory.quantity,
                minimumStock: inventory.minimumStock,
                reorderPoint: inventory.reorderPoint,
                costPrice: inventory.costPrice,
            });

            return acc;
        }, []);

        res.status(200).json(groupedData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// Fetch a specific inventory record
router.get('/:id', async (req, res) => {
    try {
        const inventory = await Inventory.findByPk(req.params.id, {
            include: [
                { model: Variant, as: 'variant' },
                { model: Warehouse, as: 'warehouse' },
                { model: Store, as: 'store' },
            ],
        });
        if (!inventory) {
            return res.status(404).json({ error: 'Inventory record not found' });
        }
        res.status(200).json(inventory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new inventory record
router.post('/', async (req, res) => {
    try {
        const { variantId, warehouseId, storeId, quantity, minimumStock, reorderPoint, costPrice } = req.body;
        const newInventory = await Inventory.create({
            variantId,
            warehouseId,
            storeId,
            quantity,
            minimumStock,
            reorderPoint,
            costPrice,
        });
        res.status(201).json(newInventory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update an inventory record
router.put('/:id', async (req, res) => {
    try {
        const { quantity, minimumStock, reorderPoint, costPrice } = req.body;
        const inventory = await Inventory.findByPk(req.params.id);

        if (!inventory) {
            return res.status(404).json({ error: 'Inventory record not found' });
        }

        inventory.quantity = quantity || inventory.quantity;
        inventory.minimumStock = minimumStock || inventory.minimumStock;
        inventory.reorderPoint = reorderPoint || inventory.reorderPoint;
        inventory.costPrice = costPrice || inventory.costPrice;

        await inventory.save();
        res.status(200).json(inventory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete an inventory record
router.delete('/:id', async (req, res) => {
    try {
        const inventory = await Inventory.findByPk(req.params.id);
        if (!inventory) {
            return res.status(404).json({ error: 'Inventory record not found' });
        }
        await inventory.destroy();
        res.status(200).json({ message: 'Inventory record deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
