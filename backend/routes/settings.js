const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
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
router.put('/', authenticateToken, async (req, res) => {
    try {
        const updatedSettings = req.body;
        console.log("Received settings:", updatedSettings);

        const updatePromises = Object.entries(updatedSettings).map(async ([key, value]) => {
            console.log(`Updating setting: ${key} = ${value}`);

            const [setting, created] = await Setting.findOrCreate({
                where: { key },
                defaults: {
                    value,
                }
            });

            if (!created) {
                setting.value = value;
                await setting.save();
            }

            return setting;
        });

        const updatedSettingsResult = await Promise.all(updatePromises);

        res.status(200).json({
            updatedSettingsResult
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(400).json({ error: error.message });
    }
});


module.exports = router;
