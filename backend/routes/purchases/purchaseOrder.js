const express = require('express');
const router = express.Router();
const { Product,PurchaseOrder, PurchaseOrderLineItem, Supplier, Warehouse, Store, Variant } = require('../../models/associations');
const authenticateToken = require('../../middleware/auth');

// Create a new Purchase Order with Line Items
router.post('/',authenticateToken, async (req, res) => {
    const { supplierId, warehouseId, storeId, orderDate, expectedDeliveryDate, status, totalAmount, lineItems } = req.body;
    console.log("supplierId, warehouseId, storeId, orderDate, expectedDeliveryDate, status, totalAmount, lineItems",supplierId, warehouseId, storeId, orderDate, expectedDeliveryDate, status, totalAmount, lineItems)
    const requiredFields = [
        'supplierId',
        'orderDate',
        'expectedDeliveryDate',
        'lineItems',
    ];

    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
        return res.status(400).json({
            error: `Missing required fields: ${missingFields.join(', ')}`,
        });
    }

    const errors = [];

    lineItems.forEach(item => {
        console.log("item.variantId",item.variantId)
        console.log("item.quantity",item.quantity)
        console.log("item.price",item.price)
        if (!item.variantId) {
            errors.push({ field: 'lineItems', message: 'Variant ID is required' });
        }
        if (!item.quantity || isNaN(item.quantity) || item.quantity <= 0) {
            errors.push({ field: 'lineItems', message: 'Quantity should be a positive number' });
        }
    });

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        // Create Purchase Order
        const purchaseOrder = await PurchaseOrder.create({
            supplierId,
            warehouseId,
            storeId,
            orderDate,
            expectedDeliveryDate,
            status,
            totalAmount,
        });

        // Create Purchase Order Line Items
        if (lineItems && lineItems.length > 0) {
            const lineItemsData = lineItems.map(item => ({
                purchaseOrderId: purchaseOrder.id,
                variantId: item.variantId,
                quantity: item.quantity,
                price: item.price,
            }));

            await PurchaseOrderLineItem.bulkCreate(lineItemsData);
        }

        res.status(201).json({ purchaseOrder });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all Purchase Orders with Line Items and Product details
router.get('/',authenticateToken, async (req, res) => {
    try {
        const purchaseOrders = await PurchaseOrder.findAll({
            include: [
                {
                    model: PurchaseOrderLineItem,
                    as: 'lineItems',
                    include: [
                        {
                            model: Variant,
                            as: 'variant',
                            include: [
                                {
                                    model: Product,
                                    as: 'Product',
                                    attributes: ['id', 'name', 'description'], // Include the product fields you want
                                },
                            ],
                        },
                    ],
                },
                { model: Supplier, as: 'supplier', attributes: ['id', 'name'] },
                { model: Warehouse, as: 'warehouse', attributes: ['id', 'name'] },
                { model: Store, as: 'store', attributes: ['id', 'name'] },
            ],
        });

        res.status(200).json(purchaseOrders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Get a single Purchase Order by ID with Line Items
router.get('/:id',authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const purchaseOrder = await PurchaseOrder.findByPk(id, {
            include: [
                {
                    model: PurchaseOrderLineItem,
                    as: 'lineItems',
                    include: [
                        { model: Variant, as: 'variant' },
                    ],
                },
                { model: Supplier, as: 'supplier' },
                { model: Warehouse, as: 'warehouse' },
                { model: Store, as: 'store' },
            ],
        });

        if (!purchaseOrder) {
            return res.status(404).json({ message: 'Purchase Order not found' });
        }

        res.status(200).json(purchaseOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a Purchase Order and its Line Items, then return the updated data
router.put('/:id',authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { supplierId, warehouseId, storeId, orderDate, expectedDeliveryDate, status, totalAmount, lineItems } = req.body;

    try {
        // Find the existing Purchase Order
        const purchaseOrder = await PurchaseOrder.findByPk(id);
        if (!purchaseOrder) {
            return res.status(404).json({ message: 'Purchase Order not found' });
        }

        // Update the Purchase Order
        await purchaseOrder.update({
            supplierId,
            warehouseId,
            storeId,
            orderDate,
            expectedDeliveryDate,
            status,
            totalAmount,
        });

        // Find existing line items for the purchase order
        const existingLineItems = await PurchaseOrderLineItem.findAll({ where: { purchaseOrderId: id } });

        // Create a map of existing line items for quick lookup
        const existingLineItemsMap = {};
        existingLineItems.forEach(item => {
            existingLineItemsMap[item.id] = item;
        });

        // Iterate over the lineItems from the request
        for (const item of lineItems) {
            if (item.id && existingLineItemsMap[item.id]) {
                // If the line item exists, update it
                await existingLineItemsMap[item.id].update({
                    variantId: item.variantId,
                    quantity: item.quantity,
                    price: item.price,
                });
                // Remove it from the map after processing
                delete existingLineItemsMap[item.id];
            } else {
                // If the line item does not exist, create it
                await PurchaseOrderLineItem.create({
                    purchaseOrderId: id,
                    variantId: item.variantId,
                    quantity: item.quantity,
                    price: item.price,
                });
            }
        }

        // Delete any remaining line items in the map (those that were not included in the request)
        const remainingLineItemIds = Object.keys(existingLineItemsMap);
        if (remainingLineItemIds.length > 0) {
            await PurchaseOrderLineItem.destroy({ where: { id: remainingLineItemIds } });
        }

        // Fetch the updated Purchase Order with its associated Line Items
        const updatedPurchaseOrder = await PurchaseOrder.findByPk(id, {
            include: [
                {
                    model: PurchaseOrderLineItem,
                    as: 'lineItems',
                    include: [
                        {
                            model: Variant,
                            as: 'variant',
                            include: [
                                {
                                    model: Product,
                                    as: 'Product',
                                    attributes: ['id', 'name'],
                                },
                                // Include other relevant associations, like AttributeValues, etc.
                            ]
                        }
                    ]
                },
                {
                    model: Supplier,
                    as: 'supplier',
                    attributes: ['id', 'name'], // Include supplier info
                },
                {
                    model: Warehouse,
                    as: 'warehouse',
                    attributes: ['id', 'name'], // Include warehouse info
                },
                {
                    model: Store,
                    as: 'store',
                    attributes: ['id', 'name'], // Include store info
                }
            ]
        });

        res.status(200).json(updatedPurchaseOrder); // Return the updated purchase order with line items
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Delete a Purchase Order and its Line Items
router.delete('/:id',authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const purchaseOrder = await PurchaseOrder.findByPk(id);
        if (!purchaseOrder) {
            return res.status(404).json({ message: 'Purchase Order not found' });
        }

        await PurchaseOrderLineItem.destroy({ where: { purchaseOrderId: id } }); // Remove line items
        await purchaseOrder.destroy(); // Remove purchase order

        res.status(200).json({ message: 'Purchase Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a single Purchase Order Line Item
router.delete('/:id/line-item/:lineItemId', async (req, res) => {
    const { id, lineItemId } = req.params;

    try {
        // Find the Purchase Order to ensure it exists
        const purchaseOrder = await PurchaseOrder.findByPk(id);
        if (!purchaseOrder) {
            return res.status(404).json({ message: 'Purchase Order not found' });
        }

        // Find the specific line item to delete
        const lineItem = await PurchaseOrderLineItem.findByPk(lineItemId);
        if (!lineItem || lineItem.purchaseOrderId !== parseInt(id, 10)) {
            return res.status(404).json({ message: 'Line Item not found or does not belong to this Purchase Order' });
        }

        // Delete the line item
        await lineItem.destroy();

        // Optionally, fetch the updated purchase order with remaining line items
        const updatedPurchaseOrder = await PurchaseOrder.findByPk(id, {
            include: [
                {
                    model: PurchaseOrderLineItem,
                    as: 'lineItems',
                    include: [
                        {
                            model: Variant,
                            as: 'variant',
                            include: [
                                {
                                    model: Product,
                                    as: 'Product',
                                    attributes: ['id', 'name'],
                                },
                            ],
                        },
                    ],
                },
                {
                    model: Supplier,
                    as: 'supplier',
                    attributes: ['id', 'name'],
                },
                {
                    model: Warehouse,
                    as: 'warehouse',
                    attributes: ['id', 'name'],
                },
                {
                    model: Store,
                    as: 'store',
                    attributes: ['id', 'name'],
                },
            ],
        });

        // Return updated purchase order
        res.status(200).json(updatedPurchaseOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;