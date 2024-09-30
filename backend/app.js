const express = require('express');
const winston = require('winston');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http'); // Import http module
const { Server } = require('socket.io'); // Import Socket.IO
require('./models/associations');
const cookieParser = require('cookie-parser');
// Import Sequelize model
const Log = require('./models/log');

// Import routes
const userRoutes = require('./routes/users/users');
const productRoutes = require('./routes/product/products');
const variantsRoutes = require('./routes/product/variants');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/product/category');
const subCategoryRoutes = require('./routes/product/subcategory');
const brandRoutes = require('./routes/product/brand');
const unitsRouter = require('./routes/product/units');
const warrantyRoutes = require('./routes/product/warranty');
const suppliersRoutes = require('./routes/product/suppliers');
const customersRoutes = require('./routes/customer');
const warehousesRoutes = require('./routes/warehouse');
const storesRoutes = require('./routes/store');
const attributesRoutes = require('./routes/product/attributes');
const attributeValuesRoutes = require('./routes/product/attributeValues');
const variantAttributeRoutes = require('./routes/product/variantAttributeValues');
const productVariantsRoutes = require('./routes/product/productVariants');
const serialNumbersRoutes = require('./routes/inventory/serialNumbers');
const inventoryRouter = require('./routes/inventory/inventory');
const paymentMethodRoutes = require('./routes/expenses/paymentMethod');
const expenseCategoryRoutes = require('./routes/expenses/expenseCategory');
const expensesRoutes = require('./routes/expenses/expenses');
const purchaseOrderRoutes = require('./routes/purchases/purchaseOrder');
const goodsReceivedRoutes = require('./routes/inventory/goodsReceived');
const rolesRoutes = require('./routes/users/role');
const permissionsRoutes = require('./routes/users/permissions');
const rolePermissionsRoutes = require('./routes/users/rolePermissions');
const userRolesRoutes = require('./routes/users/userRoles');
const rolesPermissionsRoutes = require('./routes/users/rolePermissions');
const stockMovementRoutes = require('./routes/inventory/stockMovement');
const settingsRoutes = require('./routes/settings');
const taxRoutes = require('./routes/tax');
const stockTakeRoutes = require('./routes/inventory/stockTakeRoutes');
const stockAdjustmentRoutes = require('./routes/inventory/stockAdjustments');
const couponRoutes = require('./routes/couponRoutes');
const compositionsRoutes = require('./routes/product/composition');
const paymentRoutes = require('./routes/sales/paymentRoutes');
const orderRoutes = require('./routes/sales/salesOrderRoutes');
const variantImageRoutes = require('./routes/product/variantImage');
const productWarrantyRoutes = require('./routes/product/productWarranty');
const productExpiryRoutes = require('./routes/product/productExpiry');
//const authenticateToken = require('./middleware/auth');

dotenv.config();

const app = express();
const server = http.createServer(app); // Create an HTTP server
const port = process.env.PORT || 4000;

// Initialize Socket.IO and allow CORS
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000', // Allow this origin to make requests
        methods: ['GET', 'POST'],
        credentials: true // Allow credentials (cookies) to be sent
    },
});

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());
// Configure CORS
app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    credentials: true // Allow credentials (cookies) to be sent
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
//app.use(authenticateToken);
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
app.use('/api/goods-received', goodsReceivedRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/permissions', permissionsRoutes);
app.use('/api/role-permissions', rolePermissionsRoutes);
app.use('/api/user-roles', userRolesRoutes);
app.use('/api/stock-movements', stockMovementRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/taxes', taxRoutes);
app.use('/api/stock-takes', stockTakeRoutes);
app.use('/api/stock-adjustments', stockAdjustmentRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/compositions', compositionsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/variant-images', variantImageRoutes);
app.use('/api/product-warranties', productWarrantyRoutes);
app.use('/api/product-expiries', productExpiryRoutes);


// Listen for Socket.IO connections
io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.token; // Extract token from handshake auth
  //  console.log("socket token",token)
    if (!token) {
       // console.log('No token provided');
        return next(new Error('Authentication error'));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          //  console.log('Token is invalid:', err.message);
            return next(new Error('Authentication error'));
        }
        // Attach user info to socket object if the token is valid
        socket.user = decoded;
        socket.request.socketId = socket.id;
        next(); // Proceed with the connection
    });
});
io.on('connection', (socket) => {
    //console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
        //console.log('A user disconnected:', socket.id);
    });

    // Define more socket events here
});

// Start the server
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
