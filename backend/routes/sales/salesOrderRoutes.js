const express = require('express');
const router = express.Router();
const { SalesOrder, SalesOrderLineItem, Payment } = require('../../models/associations');
const authenticateToken = require("../../middleware/auth"); // Adjust path as needed

// Create a new Sales Order
router.post('/',authenticateToken, async (req, res) => {
    try {
        const salesOrder = await SalesOrder.create(req.body);
        res.status(201).json(salesOrder);
    } catch (error) {
        res.status(500).json({ message: 'Error creating sales order', error });
    }
});

// Get all Sales Orders
router.get('/',authenticateToken, async (req, res) => {
    try {
        const salesOrders = await SalesOrder.findAll({ include: ['lineItems', 'customer', 'user', 'payments'] });
        res.status(200).json(salesOrders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sales orders', error });
    }
});

// Get a specific Sales Order by ID
router.get('/:id', authenticateToken,async (req, res) => {
    try {
        const salesOrder = await SalesOrder.findByPk(req.params.id, { include: ['lineItems', 'customer', 'user', 'payments'] });
        if (!salesOrder) return res.status(404).json({ message: 'Sales order not found' });
        res.status(200).json(salesOrder);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sales order', error });
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
