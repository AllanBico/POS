const express = require('express');
const router = express.Router();
const { DeliveryNote, DeliveryLineItem, Variant, SalesOrder, SalesOrderLineItem, Product} = require('../../models/associations'); // Import models
const sequelize = require('../../config/db');
const authenticateToken = require("../../middleware/auth");
// Create a delivery note with line items
router.post('/',authenticateToken, async (req, res) => {
    try {
        const { salesOrderId, deliveryDate, deliveryAddress, deliveryPerson, notes, createdBy, lineItems } = req.body;

        // Create the delivery note
        const deliveryNote = await DeliveryNote.create({
            salesOrderId,
            deliveryDate,
            deliveryAddress,
            deliveryPerson,
            notes,
            createdBy:req.user.id,
            status: 'pending',
        });

        // Create delivery line items
        if (lineItems && lineItems.length > 0) {
            await Promise.all(lineItems.map(async (item) => {
                await DeliveryLineItem.create({
                    deliveryNoteId: deliveryNote.id,
                    salesOrderLineItemId: item.salesOrderLineItemId || null,
                    variantId: item.variantId,
                    description: item.description,
                    quantity: item.quantity,
                });
            }));
        }

        res.status(201).json({ message: 'Delivery note created successfully', deliveryNote });
    } catch (error) {
        console.error('Error creating delivery:', error);
        res.status(500).json({ error: 'Failed to create delivery note' });
    }
});

// Get all delivery notes
router.get('/',authenticateToken, async (req, res) => {
    console.log("Fetching deliveries...");
    try {
        const deliveries = await DeliveryNote.findAll({
            include: [{ model: DeliveryLineItem, include: [{ model: Variant, include: [{ model: Product, as: 'Product' }] }] }],
        });
        console.log(`Found ${deliveries.length} deliveries`);
        console.log("deliveries",deliveries)
        res.status(200).json(deliveries);
    } catch (error) {
        console.error('Error fetching deliveries:', error);
        res.status(500).json({ error: 'Failed to fetch deliveries' });
    }
});

// Get a single delivery note by ID
router.get('/:id',authenticateToken, async (req, res) => {
    try {
        const deliveryNote = await DeliveryNote.findByPk(req.params.id, {
            include: [{ model: DeliveryLineItem, include: [Variant] }],
        });
        if (!deliveryNote) {
            return res.status(404).json({ error: 'Delivery note not found' });
        }
        res.status(200).json(deliveryNote);
    } catch (error) {
        console.error('Error fetching delivery note:', error);
        res.status(500).json({ error: 'Failed to fetch delivery note' });
    }
});

// Update a delivery note and its line items
router.put('/:id',authenticateToken, async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { deliveryDate, deliveryAddress, deliveryPerson, notes, status, lineItems } = req.body;

        // Find the delivery note
        const deliveryNote = await DeliveryNote.findByPk(req.params.id, { transaction });
        if (!deliveryNote) {
            return res.status(404).json({ error: 'Delivery note not found' });
        }

        // Update delivery note fields
        deliveryNote.deliveryDate = deliveryDate || deliveryNote.deliveryDate;
        deliveryNote.deliveryAddress = deliveryAddress || deliveryNote.deliveryAddress;
        deliveryNote.deliveryPerson = deliveryPerson || deliveryNote.deliveryPerson;
        deliveryNote.notes = notes || deliveryNote.notes;
        deliveryNote.status = status || deliveryNote.status;

        await deliveryNote.save({ transaction });

        // Update or create delivery line items
        if (lineItems && lineItems.length > 0) {
            await Promise.all(lineItems.map(async (item) => {
                if (item.id) {
                    // Update existing line item
                    const lineItem = await DeliveryLineItem.findByPk(item.id, { transaction });
                    if (lineItem) {
                        lineItem.quantity = item.quantity;
                        lineItem.description = item.description || lineItem.description;
                        await lineItem.save({ transaction });
                    }
                } else {
                    // Create new line item
                    await DeliveryLineItem.create({
                        deliveryNoteId: deliveryNote.id,
                        salesOrderLineItemId: item.salesOrderLineItemId || null,
                        variantId: item.variantId,
                        description: item.description,
                        quantity: item.quantity,
                    }, { transaction });
                }
            }));
        }

        await transaction.commit();
        res.status(200).json({ message: 'Delivery note updated successfully', deliveryNote });
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating delivery:', error);
        res.status(500).json({ error: 'Failed to update delivery note' });
    }
});

// Delete a delivery note and its line items
router.delete('/:id',authenticateToken, async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const deliveryNote = await DeliveryNote.findByPk(req.params.id, { transaction });
        if (!deliveryNote) {
            return res.status(404).json({ error: 'Delivery note not found' });
        }

        // Delete associated delivery line items
        await DeliveryLineItem.destroy({ where: { deliveryNoteId: deliveryNote.id }, transaction });

        // Delete the delivery note
        await deliveryNote.destroy({ transaction });

        await transaction.commit();
        res.status(200).json({ message: 'Delivery note deleted successfully' });
    } catch (error) {
        await transaction.rollback();
        console.error('Error deleting delivery note:', error);
        res.status(500).json({ error: 'Failed to delete delivery note' });
    }
});

module.exports = router;
