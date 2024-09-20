const express = require('express');
const router = express.Router();
const { SalesOrder, SalesOrderLineItem, Payment, Customer,Variant,Product,User} = require('../../models/associations');
const authenticateToken = require("../../middleware/auth"); // Adjust path as needed

// Create a new Sales Order
router.post('/', authenticateToken, async (req, res) => {
    try {
        console.log('Received request body:', JSON.stringify(req.body, null, 2));

        // Validate request body
        if (!isValidSalesOrderRequest(req.body)) {
            return res.status(400).json({ message: 'Invalid request. Customer ID and at least one valid line item are required.' });
        }

        // Create the sales order
        const salesOrder = await createSalesOrder(req.body, req.user.id);
        console.log('Sales order created:', salesOrder.id);

        // Create line items
        await createLineItems(salesOrder.id, req.body.lineItems);
        console.log('Line items created');

        // Fetch the created order with its line items
        const createdOrder = await fetchCreatedOrder(salesOrder.id);
        console.log('Created order fetched');

        res.status(201).json(createdOrder);
    } catch (error) {
        console.error('Error creating sales order:', error);
        res.status(500).json({ message: 'Error creating sales order', error: error.message });
    }
});

// Helper functions

function isValidSalesOrderRequest(body) {
    return body.lineItems && 
           Array.isArray(body.lineItems) && 
           body.lineItems.length > 0 &&
           body.lineItems.every(isValidLineItem);
}

function isValidLineItem(item) {
    return item.variantId && 
           item.quantity && 
           item.quantity > 0;
}

async function createSalesOrder(body, userId) {
    const { customer_id, total, status } = body;
    return await SalesOrder.create({
        customerId: customer_id,
        total,
        status,
        createdBy: userId,
        totalAmount: total,
        netTotal: total,
        userId: userId,
    });
}

async function createLineItems(salesOrderId, lineItems) {
    await Promise.all(lineItems.map(item => 
        SalesOrderLineItem.create({
            salesOrderId: salesOrderId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity
        })
    ));
}

async function fetchCreatedOrder(salesOrderId) {
    return await SalesOrder.findByPk(salesOrderId, {
        include: [
            { model: SalesOrderLineItem, as: 'lineItems' },
            { model: Customer, as: 'customer' }
        ]
    });
}

// Get all Sales Orders
router.get('/', authenticateToken, async (req, res) => {
    try {
        console.log('Fetching sales orders...');
        const salesOrders = await SalesOrder.findAll({
            include: [
                { model: Customer, as: 'customer' }
            ]
        });
        console.log(`Found ${salesOrders.length} sales orders`);
        res.status(200).json(salesOrders);
    } catch (error) {
        console.error('Error fetching sales orders:', error);
        res.status(500).json({ message: 'Error fetching sales orders', error });
    }
});

// Get a specific Sales Order by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        console.log(`Fetching sales order with id: ${req.params.id}`);
        const salesOrder = await SalesOrder.findByPk(req.params.id, {
            include: [
                {
                    model: SalesOrderLineItem,
                    as: 'lineItems',
                    include: [{
                        model: Variant,
                        as: 'variant',
                        include: [{
                            model: Product,
                            as: 'Product'
                        }]
                    }]
                },
                { model: Customer, as: 'customer' },
                { model: User, as: 'user' },
                { model: Payment, as: 'payments' }
            ]
        });
        if (!salesOrder) {
            console.log(`Sales order with id ${req.params.id} not found`);
            return res.status(404).json({ message: 'Sales order not found' });
        }
        console.log(`Successfully fetched sales order with id: ${req.params.id}`);
        res.status(200).json(salesOrder);
    } catch (error) {
        console.error('Error fetching sales order:', error);
        res.status(500).json({ message: 'Error fetching sales order', error: error.message });
    }
});

// Update a Sales Order
router.put('/:id',authenticateToken, async (req, res) => {
    try {
        const updatedSalesOrder = await SalesOrder.update(req.body, { where: { id: req.params.id } });
        res.status(200).json(updatedSalesOrder);
    } catch (error) {
        res.status(500).json({ message: 'Error updating sales order', error });
    }
});

// Delete a Sales Order
router.delete('/:id',authenticateToken, async (req, res) => {
    try {
        const deleted = await SalesOrder.destroy({ where: { id: req.params.id } });
        if (deleted) return res.status(204).json();
        res.status(404).json({ message: 'Sales order not found' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting sales order', error });
    }
});

router.post('/items/',authenticateToken, async (req, res) => {
    try {
        const lineItem = await SalesOrderLineItem.create(req.body);
        res.status(201).json(lineItem);
    } catch (error) {
        res.status(500).json({ message: 'Error creating line item', error });
    }
});

// Get all Sales Order Line Items
router.get('/items/',authenticateToken, async (req, res) => {
    try {
        const lineItems = await SalesOrderLineItem.findAll();
        res.status(200).json(lineItems);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching line items', error });
    }
});

// Get a specific Sales Order Line Item by ID
router.get('/items/:id',authenticateToken, async (req, res) => {
    try {
        const lineItem = await SalesOrderLineItem.findByPk(req.params.id);
        if (!lineItem) return res.status(404).json({ message: 'Line item not found' });
        res.status(200).json(lineItem);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching line item', error });
    }
});

// Update a Sales Order Line Item
router.put('/items/:id', authenticateToken,async (req, res) => {
    try {
        const updatedLineItem = await SalesOrderLineItem.update(req.body, { where: { id: req.params.id } });
        res.status(200).json(updatedLineItem);
    } catch (error) {
        res.status(500).json({ message: 'Error updating line item', error });
    }
});

// Delete a Sales Order Line Item
router.delete('/items/:id',authenticateToken, async (req, res) => {
    try {
        const deleted = await SalesOrderLineItem.destroy({ where: { id: req.params.id } });
        if (deleted) return res.status(204).json();
        res.status(404).json({ message: 'Line item not found' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting line item', error });
    }
});
module.exports = router;
