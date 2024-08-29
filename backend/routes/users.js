const express = require('express');
const router = express.Router();
const db = require('../models'); // Adjust based on your database setup

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await db.User.findAll(); // Use Sequelize or your DB library
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Get a specific user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await db.User.findByPk(req.params.id); // Use Sequelize or your DB library
        if (user) {
            res.json(user);
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Create a new user
router.post('/', async (req, res) => {
    try {
        const newUser = await db.User.create(req.body); // Use Sequelize or your DB library
        res.status(201).json(newUser);
    } catch (err) {
        console.error(err);
        res.status(400).send('Bad request');
    }
});

// Update a user
router.put('/:id', async (req, res) => {
    try {
        const [updated] = await db.User.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedUser = await db.User.findByPk(req.params.id);
            res.json(updatedUser);
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        console.error(err);
        res.status(400).send('Bad request');
    }
});

// Delete a user
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await db.User.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
