const express = require('express');
const router = express.Router();
const { Expense,ExpenseCategory,PaymentMethod,Supplier } = require('../../models/associations');
const authenticateToken = require("../../middleware/auth");

// Get all expenses
router.get('/',authenticateToken, async (req, res) => {
    try {
        const expenses = await Expense.findAll({
            include: [
                { model: ExpenseCategory, as: 'ExpenseCategory' },
                { model: PaymentMethod, as: 'PaymentMethod' },
                { model: Supplier, as: 'Supplier' }
            ]
        });
        res.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'An error occurred while fetching expenses' });
    }
});

// Get an expense by ID
router.get('/:id',authenticateToken, async (req, res) => {
    try {
        const expense = await Expense.findByPk(req.params.id, {
            include: [
                { model: ExpenseCategory, as: 'ExpenseCategory' },
                { model: PaymentMethod, as: 'PaymentMethod' },
                { model: Supplier, as: 'Supplier' }
            ]
        });
        if (expense) {
            res.json(expense);
        } else {
            res.status(404).json({ error: 'Expense not found' });
        }
    } catch (error) {
        console.error('Error fetching expense:', error);
        res.status(500).json({ error: 'An error occurred while fetching the expense' });
    }
});

// Create a new expense
router.post('/',authenticateToken, async (req, res) => {
    try {
        const expense = await Expense.create(req.body);
        const newExpense = await Expense.findByPk(expense.id, {
            include: [
                { model: ExpenseCategory, as: 'ExpenseCategory' },
                { model: PaymentMethod, as: 'PaymentMethod' },
                { model: Supplier, as: 'Supplier' }
            ]
        });
        res.status(201).json(newExpense);
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ error: 'An error occurred while creating the expense' });
    }
});

// Update an expense
router.put('/:id',authenticateToken, async (req, res) => {
    try {
        const [updated] = await Expense.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedExpense = await Expense.findByPk(req.params.id);
            res.json(updatedExpense);
        } else {
            res.status(404).json({ error: 'Expense not found' });
        }
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ error: 'An error occurred while updating the expense' });
    }
});

// Delete an expense
router.delete('/:id',authenticateToken, async (req, res) => {
    try {
        const deleted = await Expense.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.status(204).end();
        } else {
            res.status(404).json({ error: 'Expense not found' });
        }
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: 'An error occurred while deleting the expense' });
    }
});

module.exports = router;