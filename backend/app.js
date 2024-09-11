const express = require('express');
const winston = require('winston');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http'); // Import http module
const { Server } = require('socket.io'); // Import Socket.IO
require('./models/associations');
// Import Sequelize model
const Log = require('./models/log');

// Import routes
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const variantsRoutes = require('./routes/variants');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/category');
const subCategoryRoutes = require('./routes/subcategory');
const brandRoutes = require('./routes/brand');
const unitsRouter = require('./routes/units');
const warrantyRoutes = require('./routes/warranty');
const suppliersRoutes = require('./routes/suppliers');
const customersRoutes = require('./routes/customer');
const warehousesRoutes = require('./routes/warehouse');
const storesRoutes = require('./routes/store');
const attributesRoutes = require('./routes/attributes');
const attributeValuesRoutes = require('./routes/attributeValues');
const variantAttributeRoutes = require('./routes/variantAttributeValues');
const productVariantsRoutes = require('./routes/productVariants');
const serialNumbersRoutes = require('./routes/serialNumbers');
const inventoryRouter = require('./routes/inventory');
const paymentMethodRoutes = require('./routes/paymentMethod');
const expenseCategoryRoutes = require('./routes/expenseCategory');
const expensesRoutes = require('./routes/expenses');
const purchaseOrderRoutes = require('./routes/purchaseOrder');



dotenv.config();

const app = express();
const server = http.createServer(app); // Create an HTTP server
const port = process.env.PORT || 4000;

// Initialize Socket.IO and allow CORS
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000', // Allow this origin to make requests
        methods: ['GET', 'POST'],
    },
});

// Middleware to parse JSON bodies
app.use(express.json());

// Configure CORS
app.use(cors({
    origin: 'http://localhost:3000',
}));

// Configure Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'user-actions.log' }),
        //new winston.transports.Console(),
    ],
});

// Middleware to log user actions and save to the database
app.use(async (req, res, next) => {
    const logEntry = {
        method: req.method,
        url: req.url,
        user_id: req.user ? req.user.id : 'anonymous',
        timestamp: new Date(),
        body: req.body,
        query: req.query,
    };

    logger.info('User action', logEntry);

    // Save log entry to PostgreSQL database
    try {
        await Log.create(logEntry);
    } catch (error) {
        console.error('Failed to save log entry to database:', error);
    }

    next();
});

// Use routes and pass Socket.IO to them
app.use((req, res, next) => {
    req.io = io; // Attach the io instance to the request object
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/variants', variantsRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/units', unitsRouter);
app.use('/api/warranties', warrantyRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/warehouses', warehousesRoutes);
app.use('/api/stores', storesRoutes);
app.use('/api/attributes', attributesRoutes);
app.use('/api/attribute-values', attributeValuesRoutes);
app.use('/api/product-variants', productVariantsRoutes);
app.use('/api/variant-attribute-values', variantAttributeRoutes);
app.use('/api/serial-numbers', serialNumbersRoutes);
app.use('/api/inventories', inventoryRouter);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/expense-categories', expenseCategoryRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);


// Listen for Socket.IO connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });

    // Define more socket events here
});

// Start the server
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
