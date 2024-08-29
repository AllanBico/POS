const express = require('express');
const app = express();
const port = 3000;

// Import routes
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');

// Middleware
app.use(express.json());

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
