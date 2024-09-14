const express = require('express');
const router = express.Router();
const { GoodsReceived, PurchaseOrder, Warehouse, GoodsReceivedLineItem, Variant,Store, Supplier,SerialNumber,Inventory,StockMovement} = require('../../models/associations');
const authenticateToken = require("../../middleware/auth");
const sequelize = require('../../config/db');
// Create a Goods Received (GRN)
router.post('/', authenticateToken, async (req, res) => {
    const transaction = await sequelize.transaction(); // Create a transaction
    try {
        const { purchaseOrderId, warehouseId, receivedDate, storeId, lineItems } = req.body;

        // Validate the request body
        const requiredFields = [
            'purchaseOrderId',
            'receivedDate',
            'lineItems',
        ];

        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            console.log(`Missing required fields: ${missingFields.join(', ')}`)
            return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
        }

        // Validate each line item and its serial numbers
        for (const item of lineItems) {
            if (!item.variantId || !item.quantity) {
                console.log('Invalid line item')
                return res.status(400).json({ error: 'Invalid line item' });
            }
            if (item.serialNumbers && item.serialNumbers.length > 0) {
                if (item.serialNumbers.length !== item.quantity) {
                    console.log('The number of serial numbers must match the quantity')
                    return res.status(400).json({ error: 'The number of serial numbers must match the quantity' });
                }
            }
        }

        // Create the Goods Received entry within the transaction
        const goodsReceived = await GoodsReceived.create({
            purchaseOrderId,
            warehouseId,
            receivedDate,
            storeId,
        }, { transaction });

        // Create line items and their associated serial numbers within the transaction
        const createdLineItems = await Promise.all(lineItems.map(async (item) => {
            const variant = await Variant.findByPk(item.variantId, { transaction });
            if (!variant) {
                console.log(`Variant with id ${item.variantId} not found`)
                throw new Error(`Variant with id ${item.variantId} not found`);
            }


            const lineItem = await GoodsReceivedLineItem.create({
                variantId: item.variantId,
                receivedQuantity: item.quantity,
                goodsReceivedId: goodsReceived?.id,
            }, { transaction });
            let destinationType = null;
            let destinationId = null;
            if (warehouseId) {
                destinationType = 'warehouse';
                destinationId =warehouseId;
            } else if (storeId) {
                destinationType = 'store';
                destinationId = storeId;
            }
            // Create a StockMovement record
            const stockMovement = await StockMovement.create({
                variantId: item.variantId,
                quantity: item.quantity,
                transactionType: 'stock_in',
                sourceType: 'supplier', // Assuming the source is a supplier (you can adjust as necessary)
                sourceId: purchaseOrderId, // Use purchase order as source for this case
                destinationType: destinationType, // Assuming the destination is a warehouse
                destinationId: destinationId, // This is the destination warehouse
                destinationStoreId: storeId,
                sourceStoreId: null,
                transactionDate: receivedDate,
                sourceWarehouseId: null,
                destinationWarehouseId: warehouseId,
                //createdBy: req.user.id,
                createdBy: 7,
            }, { transaction });

            let inventory = await Inventory.findOne({
                where: {
                    variantId: item.variantId,
                    warehouseId: destinationType === 'warehouse' ? destinationId : null,
                    storeId: destinationType === 'store' ? destinationId : null,
                }
            });

            if (inventory) {
                // If inventory exists, update the quantity
                inventory.quantity += item.quantity;
                await inventory.save({ transaction });
            } else {
                // If no inventory exists, create a new record
                inventory = await Inventory.create({
                    variantId: item.variantId,
                    warehouseId: destinationType === 'warehouse' ? destinationId : null,
                    storeId: destinationType === 'store' ? destinationId : null,
                    quantity: item.quantity,
                }, { transaction });
            }
            console.log("inventory updated",inventory)
            await variant.incrementStock(item.quantity, transaction);

            // If serial numbers are provided, create entries for them
            if (item.serialNumbers && item.serialNumbers.length > 0) {
                await Promise.all(item.serialNumbers.map(async (serialNumber) => {
                    await SerialNumber.create({
                        serialNumber: serialNumber,
                        variantId: item.variantId,
                        stockMovementId: stockMovement.id,
                    }, { transaction });
                }));
            }

            return lineItem;
        }));

        // Commit the transaction after all operations are successful
        await transaction.commit();

        res.status(201).json({ goodsReceived, lineItems: createdLineItems });

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error("error.message",error.message)
        res.status(500).json({ error: error });
    }
});


// Fetch all Goods Received (GRNs)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const goodsReceived = await GoodsReceived.findAll({
            include: [
                {
                    model: PurchaseOrder,
                    as: 'purchaseOrder',
                    include: [{ model: Supplier, as: 'supplier' }]
                },
                {
                    model: Warehouse,
                    as: 'warehouse'
                },
                {
                    model: Store,
                    as: 'store'
                },
                {
                    model: GoodsReceivedLineItem,
                    as: 'lineItems',
                    include: [
                        {
                            model: Variant,
                            as: 'variant',
                            include: [{ model: SerialNumber, as: 'serialNumbers' }] // Include serial numbers
                        }
                    ]
                }
            ]
        });

        res.status(200).json(goodsReceived);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Fetch a single Goods Received entry by ID
router.get('/:id',authenticateToken, async (req, res) => {
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
router.put('/:id',authenticateToken, async (req, res) => {
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
router.delete('/:id',authenticateToken, async (req, res) => {
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