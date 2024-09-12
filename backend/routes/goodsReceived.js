const express = require('express');
const router = express.Router();
const { GoodsReceived, PurchaseOrder, Warehouse, GoodsReceivedLineItem, Variant,Store, Supplier} = require('../models/associations');

// Create a Goods Received (GRN)
router.post('/', async (req, res) => {
    try {
        console.log("req.body",req.body)
        const { purchaseOrderId, warehouseId, receivedDate,storeId, lineItems } = req.body;

        // Validate the request body
        const requiredFields = [
            'purchaseOrderId',
            'warehouseId',
            'receivedDate',
            'storeId',
            'lineItems',
        ];

        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            console.error(`Missing required fields: ${missingFields.join(', ')}`);
            return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
        }

        // Validate each line item
        for (const item of lineItems) {
            if (!item.variantId || !item.quantity) {
                console.error("Invalid line item")
                return res.status(400).json({ error: 'Invalid line item' });
            }
        }

        // Create the Goods Received entry
        const goodsReceived = await GoodsReceived.create({ purchaseOrderId, warehouseId, receivedDate,storeId });

        // Create line items associated with the Goods Received entry
        const createdLineItems = await Promise.all(lineItems.map(async (item) => {
            try {
                return await GoodsReceivedLineItem.create({
                    variantId: item.variantId,
                    receivedQuantity: item.quantity,
                    goodsReceivedId: goodsReceived.id,
                });
            } catch (error) {
                // Rollback the transaction if any line item creation fails
                await goodsReceived.destroy();
                throw error;
            }
        }));

        res.status(201).json({ goodsReceived, lineItems: createdLineItems });
    } catch (error) {
        console.error("error",error.message)
        res.status(500).json({ error: error.message });
    }
});

// Fetch all Goods Received (GRNs)
router.get('/', async (req, res) => {
    try {
        const goodsReceived = await GoodsReceived.findAll({
            include: [
                { model: PurchaseOrder, as: 'purchaseOrder', include: [{model:Supplier, as:'supplier'}] },
                { model: Warehouse, as: 'warehouse' },
                { model: Store, as: 'store' },
                { model: GoodsReceivedLineItem, as: 'lineItems', include: [{model:Variant, as:'variant'}] }
            ]
        });
        res.status(200).json(goodsReceived);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch a single Goods Received entry by ID
router.get('/:id', async (req, res) => {
    try {
        const goodsReceived = await GoodsReceived.findByPk(req.params.id, {
            include: [
                { model: PurchaseOrder, as: 'purchaseOrder' },
                { model: Warehouse, as: 'warehouse' },
                { model: Store, as: 'store' },
                { model: GoodsReceivedLineItem, as: 'lineItems', include: [Variant] }
            ]
        });
        if (!goodsReceived) {
            return res.status(404).json({ error: 'Goods Received not found' });
        }
        res.status(200).json(goodsReceived);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a Goods Received entry
router.put('/:id', async (req, res) => {
    try {
        const { purchaseOrderId, warehouseId, receivedDate, lineItems } = req.body;

        // Find the existing Goods Received entry
        const goodsReceived = await GoodsReceived.findByPk(req.params.id);
        if (!goodsReceived) {
            return res.status(404).json({ error: 'Goods Received not found' });
        }

        // Update the Goods Received entry
        await goodsReceived.update({ purchaseOrderId, warehouseId, receivedDate });

        // Update the line items
        await Promise.all(lineItems.map(async (item) => {
            const lineItem = await GoodsReceivedLineItem.findByPk(item.id);
            if (lineItem) {
                await lineItem.update({
                    variantId: item.variantId,
                    receivedQuantity: item.receivedQuantity
                });
            } else {
                await GoodsReceivedLineItem.create({
                    variantId: item.variantId,
                    receivedQuantity: item.receivedQuantity,
                    goodsReceivedId: goodsReceived.id
                });
            }
        }));

        res.status(200).json({ goodsReceived, lineItems });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a Goods Received entry
router.delete('/:id', async (req, res) => {
    try {
        const goodsReceived = await GoodsReceived.findByPk(req.params.id);
        if (!goodsReceived) {
            return res.status(404).json({ error: 'Goods Received not found' });
        }

        // Delete associated line items
        await GoodsReceivedLineItem.destroy({ where: { goodsReceivedId: goodsReceived.id } });

        // Delete the Goods Received entry
        await goodsReceived.destroy();

        res.status(200).json({ message: 'Goods Received entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
