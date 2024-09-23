// utils/imageProcessor.js
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Function to process the image (resize, compress, etc.)
const processImage = async (file) => {

    console.log("file",file)
    console.log("typeof file.path",typeof file.path)
    console.log("!file.path",!file.path)
    console.log("!file",!file)
    if (!file || !file.path || typeof file.path !== 'string') {
        throw new Error('Invalid file object');
    }

    const outputPath = path.join('uploads', 'processed', `${Date.now()}-processed-${file.filename}`);
    try {
        await sharp(file.path)
            .resize(500, 500) // Resize to 500x500 pixels
            .jpeg({ quality: 80 }) // Compress and convert to JPEG
            .toFile(outputPath);

        // Remove the original file after processing (optional)
        try {
            fs.unlinkSync(file.path);
        } catch (error) {
            console.warn('Error removing original file:', error);
        }

        return outputPath;
    } catch (error) {
        console.error('Error processing image:', error);
        throw error;
    }
};

module.exports = { processImage };
