const express = require('express');
const router = express.Router();
const { PurchaseOrderLineItem,GoodsReceived, PurchaseOrder, Warehouse, GoodsReceivedLineItem, Variant,Store, Supplier,SerialNumber,Inventory,StockMovement} = require('../../models/associations');
const authenticateToken = require("../../middleware/auth");
const sequelize = require('../../config/db');
// Create a Goods Received (GRN)
router.post('/', authenticateToken, async (req, res) => {
    console.log('Received Goods Received request body:', JSON.stringify(req.body, null, 2));
    const transaction = await sequelize.transaction(); // Create a transaction
    console.log('Transaction started');

    try {
        const { purchaseOrderId, warehouseId, receivedDate, storeId, lineItems } = req.body;

        // Validate the request body
        const requiredFields = ['purchaseOrderId', 'receivedDate', 'lineItems'];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            console.log(`Missing required fields: ${missingFields.join(', ')}`);
            return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
        }

        console.log(`Validated request body for purchaseOrderId: ${purchaseOrderId}`);

        // Validate each line item and its serial numbers
        for (const item of lineItems) {
            console.log(`Validating line item for variantId: ${item.variantId}`);
            if (!item.variantId || !item.quantity) {
                console.log(`Invalid line item: variantId: ${item.variantId}, quantity: ${item.quantity}`);
                return res.status(400).json({ error: 'Invalid line item' });
            }
            // if (item.serialNumbers && item.serialNumbers.length > 0 && item.serialNumbers.length !== item.quantity) {
            //     console.log(`Mismatch in serial numbers for variantId: ${item.variantId}. Expected: ${item.quantity}, Found: ${item.serialNumbers.length}`);
            //     return res.status(400).json({ error: 'The number of serial numbers must match the quantity' });
            // }
        }

        console.log('Creating Goods Received Note...');
        const goodsReceived = await GoodsReceived.create({
            purchaseOrderId,
            warehouseId,
            receivedDate,
            storeId,
        }, { transaction });
        console.log('Goods Received Note created with ID:', goodsReceived.id);

        let allItemsFullyReceived = true;

        console.log(`Processing ${lineItems.length} line items...`);
        const createdLineItems = await Promise.all(lineItems.map(async (item) => {
            console.log(`Processing line item for variantId: ${item.variantId}`);

            const variant = await Variant.findByPk(item.variantId, { transaction });
            if (!variant) {
                console.error(`Variant with id ${item.variantId} not found`);
                throw new Error(`Variant with id ${item.variantId} not found`);
            }

            // Fetch the corresponding PurchaseOrderLineItem and update the receivedQuantity
            const purchaseOrderLineItem = await PurchaseOrderLineItem.findOne({
                where: { purchaseOrderId, variantId: item.variantId },
                transaction,
            });

            if (!purchaseOrderLineItem) {
                console.error(`PurchaseOrderLineItem not found for variantId ${item.variantId}`);
                throw new Error(`PurchaseOrderLineItem not found for variantId ${item.variantId}`);
            }

            console.log(`Updating receivedQuantity for PurchaseOrderLineItem for variantId: ${item.variantId}`);
            purchaseOrderLineItem.receivedQuantity += item.receivedQuantity;

            if (purchaseOrderLineItem.receivedQuantity > purchaseOrderLineItem.quantity) {
                console.error(`Received quantity exceeds ordered quantity for variantId ${item.variantId}`);
                throw new Error(`Received quantity exceeds ordered quantity for variantId ${item.variantId}`);
            }

            await purchaseOrderLineItem.save({ transaction });

            if (purchaseOrderLineItem.receivedQuantity !== purchaseOrderLineItem.quantity) {
                console.log(`Partial receipt for variantId: ${item.variantId}`);
                allItemsFullyReceived = false;
            }

            const lineItem = await GoodsReceivedLineItem.create({
                variantId: item.variantId,
                receivedQuantity: item.quantity, // Received in this transaction
                goodsReceivedId: goodsReceived.id,
                note: item.note,
                status: item.quantity !== item.expectedQuantity ? 'partially_received' : 'fully_received',
            }, { transaction });

            console.log(`Created GoodsReceivedLineItem for variantId: ${item.variantId}`);

            let destinationType = warehouseId ? 'warehouse' : 'store';
            let destinationId = warehouseId || storeId;

            console.log(`Creating StockMovement for variantId: ${item.variantId}`);
            const stockMovement = await StockMovement.create({
                variantId: item.variantId,
                quantity: item.quantity,
                transactionType: 'stock_in',
                sourceType: 'supplier',
                sourceId: purchaseOrderId,
                destinationType,
                destinationId,
                transactionDate: receivedDate,
                createdBy: req.user.id || 7, // Adjust the user id accordingly
            }, { transaction });

            console.log(`StockMovement created for variantId: ${item.variantId}`);

            let inventory = await Inventory.findOne({
                where: {
                    variantId: item.variantId,
                    warehouseId: destinationType === 'warehouse' ? destinationId : null,
                    storeId: destinationType === 'store' ? destinationId : null,
                }
            });

            if (inventory) {
                console.log(`Updating inventory for variantId: ${item.variantId}`);
                inventory.quantity += item.quantity;
                await inventory.save({ transaction });
            } else {
                console.log(`Creating new inventory record for variantId: ${item.variantId}`);
                inventory = await Inventory.create({
                    variantId: item.variantId,
                    warehouseId: destinationType === 'warehouse' ? destinationId : null,
                    storeId: destinationType === 'store' ? destinationId : null,
                    quantity: item.quantity,
                }, { transaction });
            }

            await variant.incrementStock(item.quantity, transaction);

            // If serial numbers are provided, create entries for them
            if (item.serialNumbers && item.serialNumbers.length > 0) {
                console.log(`Processing ${item.serialNumbers.length} serial numbers for variantId: ${item.variantId}`);
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

        console.log('Finished processing line items');

        // Determine the status of the purchase order
        const purchaseOrderStatus = allItemsFullyReceived ? 'received' : 'partial';
        console.log(`Updating purchase order status to: ${purchaseOrderStatus}`);

        // Update the Purchase Order status
        await PurchaseOrder.update(
            { status: purchaseOrderStatus },
            { where: { id: purchaseOrderId }, transaction }
        );

        console.log('Purchase Order status updated');

        // Commit the transaction after all operations are successful
        await transaction.commit();
        console.log('Transaction committed successfully');

        res.status(201).json({ goodsReceived, lineItems: createdLineItems });

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Error occurred, transaction rolled back:', error.message);
        console.error(error.stack); // Log the stack trace for more details
        res.status(500).json({ error: error.message });
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