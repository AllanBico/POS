const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Adjust based on your database setup
const bcrypt = require('bcrypt');
const authMiddleware = require('../middleware/auth');
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
    const { name, email, password } = req.body;
    console.log("name, email, password",name, email, password)
    try {
        // Find the user by ID
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Update user details
        const updatedUser = {
            name: name || user.name,
            email: email || user.email,
        };

        if (password) {
            // Hash the new password
            const salt = await bcrypt.genSalt(10);
            updatedUser.password_hash = await bcrypt.hash(password, salt);
        }

        const [updated] = await User.update(updatedUser, {
            where: { id: req.params.id }
        });

        if (updated) {
            // Retrieve and send the updated user
            const user = await User.findByPk(req.params.id);
            res.json(user);
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
