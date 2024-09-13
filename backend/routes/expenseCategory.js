// routes/expenseCategory.js
const express = require('express');
const router = express.Router();
const { ExpenseCategory } = require('../models/associations');
const authenticateToken = require("../middleware/auth"); // Adjust the import path if needed

// Get all expense categories
router.get('/',authenticateToken, async (req, res) => {
    try {
        const expenseCategories = await ExpenseCategory.findAll();
        res.json(expenseCategories);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching expense categories.' });
    }
});

// Get a single expense category by ID
router.get('/:id',authenticateToken, async (req, res) => {
    try {
        const expenseCategory = await ExpenseCategory.findByPk(req.params.id);
        if (expenseCategory) {
            res.json(expenseCategory);
        } else {
            res.status(404).json({ error: 'Expense category not found.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching the expense category.' });
    }
});

// Create a new expense category
router.post('/',authenticateToken, async (req, res) => {
    try {
        const { name, description } = req.body;
        const newExpenseCategory = await ExpenseCategory.create({ name, description });
        res.status(201).json(newExpenseCategory);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while creating the expense category.' });
    }
});

// Update an existing expense category
router.put('/:id',authenticateToken, async (req, res) => {
    try {
        const { name, description } = req.body;
        const expenseCategory = await ExpenseCategory.findByPk(req.params.id);
        if (expenseCategory) {
            await expenseCategory.update({ name, description });
            res.json(expenseCategory);
        } else {
            res.status(404).json({ error: 'Expense category not found.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while updating the expense category.' });
    }
});

// Delete an expense category
router.delete('/:id',authenticateToken, async (req, res) => {
    try {
        const expenseCategory = await ExpenseCategory.findByPk(req.params.id);
        if (expenseCategory) {
            await expenseCategory.destroy();
            res.status(204).end();
        } else {
            res.status(404).json({ error: 'Expense category not found.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while deleting the expense category.' });
    }
});

module.exports = router;