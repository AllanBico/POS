// routes/variantImageRoutes.js

const express = require('express');
const router = express.Router();
const upload = require('../../utils/upload'); // Multer setup
const { processImage } = require('../../utils/imageProcessor'); // Sharp processing
const {VariantImage} = require('../../models/associations'); // VariantImage model
const fs = require('fs');
const path = require('path');

// CREATE - Upload image
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { variantId } = req.body;
        console.log("req.file", req.file);

        if (!variantId) {
            return res.status(400).json({ message: 'variantId is required' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const imagePath = req.file;
        const processedImagePath = await processImage(imagePath);

        const variantImage = await VariantImage.create({
            imageUrl: processedImagePath,
            variantId,
        });

        res.status(201).json(variantImage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error uploading image' });
    }
});
// READ - Get all images for a variant
router.get('/:variantId', async (req, res) => {
    try {
        const images = await VariantImage.findAll({ where: { variantId: req.params.variantId } });
        res.status(200).json(images);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching images' });
    }
});

// READ - Get a single image by ID
router.get('/:id', async (req, res) => {
    try {
        const image = await VariantImage.findByPk(req.params.id);
        if (!image) return res.status(404).json({ message: 'Image not found' });
        res.status(200).json(image);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching image' });
    }
});

// UPDATE - Update an existing image (Re-upload)
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const image = await VariantImage.findByPk(req.params.id);
        if (!image) return res.status(404).json({ message: 'Image not found' });

        // Process the new image
        const processedImagePath = await processImage(req.file);

        // Delete old image file
        fs.unlinkSync(path.join(__dirname, '..', image.imageUrl));

        // Update the image path in the database
        image.imageUrl = processedImagePath;
        await image.save();

        res.status(200).json(image);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating image' });
    }
});

// DELETE - Delete an image
router.delete('/:id', async (req, res) => {
    try {
        const image = await VariantImage.findByPk(req.params.id);
        if (!image) return res.status(404).json({ message: 'Image not found' });

        // Delete the image file from the server
        fs.unlinkSync(path.join(__dirname, '..', image.imageUrl));

        // Delete the record from the database
        await image.destroy();

        res.status(200).json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting image' });
    }
});

module.exports = router;
