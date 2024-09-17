const express = require('express');
const router = express.Router();
const Setting = require('../models/setting');
const authenticateToken = require('../middleware/auth');

// Get all settings
router.get('/', authenticateToken, async (req, res) => {
    try {
        const settings = await Setting.findAll();
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a setting by ID
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { value } = req.body;
        const setting = await Setting.findByPk(req.params.id);
        if (!setting) {
            return res.status(404).json({ error: 'Setting not found' });
        }

        setting.value = value;
        await setting.save();
        res.status(200).json(setting);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
