// utils/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Add this line to import the 'fs' module

// Define storage settings using multer.diskStorage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Make sure the destination folder exists
        const dest = 'uploads/';
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${Date.now()}-${file.fieldname}${ext}`;
        cb(null, filename);
    }
});

// Filter to allow only image uploads
const fileFilter = (req, file, cb) => {
    if (!file || !file.mimetype) {
        cb(new Error('No file or no MIME type'), false);
    } else if (!file.mimetype.startsWith('image')) {
        cb(new Error('Only image files are allowed'), false);
    } else {
        cb(null, true);
    }
};

// Multer configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB max file size
    }
});

module.exports = upload;
