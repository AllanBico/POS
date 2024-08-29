const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Adjust based on your database setup
const bcrypt = require('bcrypt');
// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.findAll(); // Use Sequelize or your DB library
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Get a specific user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id); // Use Sequelize or your DB library
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
        const { name, email, password } = req.body;

        // Validate request
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create a new user instance
        const newUser = await User.create({
            name,
            email,
            password_hash: passwordHash // Set the hashed password
        });

        res.status(201).json(newUser);
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(400).json({ message: 'Bad request', error: err.message });
    }
});

// Update a user
router.put('/:id', async (req, res) => {
    try {
        const [updated] = await User.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedUser = await User.findByPk(req.params.id);
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
        const { id } = req.params;
        const deletedUser = await User.destroy({ where: { id } });

        if (deletedUser) {
            res.status(204).send(); // No content
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(400).json({ message: 'Bad request', error: err.message });
    }
});

module.exports = router;
