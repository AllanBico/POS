const express = require('express');
const winston = require('winston');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
require('./models/associations');

// Import Sequelize model
const Log = require('./models/log');

// Import routes
const routes = {
    auth: require('./routes/auth'),
    users: require('./routes/users/users'),
    products: require('./routes/product/products'),
    variants: require('./routes/product/variants'),
    categories: require('./routes/product/category'),
    subCategories: require('./routes/product/subcategory'),
    brands: require('./routes/product/brand'),
    units: require('./routes/product/units'),
    warranties: require('./routes/product/warranty'),
    suppliers: require('./routes/product/suppliers'),
    customers: require('./routes/customer'),
    warehouses: require('./routes/warehouse'),
    stores: require('./routes/store'),
    attributes: require('./routes/product/attributes'),
    attributeValues: require('./routes/product/attributeValues'),
    variantAttributes: require('./routes/product/variantAttributeValues'),
    productVariants: require('./routes/product/productVariants'),
    serialNumbers: require('./routes/inventory/serialNumbers'),
    inventory: require('./routes/inventory/inventory'),
    paymentMethods: require('./routes/expenses/paymentMethod'),
    expenseCategories: require('./routes/expenses/expenseCategory'),
    expenses: require('./routes/expenses/expenses'),
    purchaseOrders: require('./routes/purchases/purchaseOrder'),
    goodsReceived: require('./routes/inventory/goodsReceived'),
    roles: require('./routes/users/role'),
    permissions: require('./routes/users/permissions'),
    rolePermissions: require('./routes/users/rolePermissions'),
    userRoles: require('./routes/users/userRoles'),
    stockMovements: require('./routes/inventory/stockMovement'),
    settings: require('./routes/settings'),
    taxes: require('./routes/tax'),
    stockTakes: require('./routes/inventory/stockTakeRoutes'),
    stockAdjustments: require('./routes/inventory/stockAdjustments'),
    coupons: require('./routes/couponRoutes'),
    compositions: require('./routes/product/composition'),
    payments: require('./routes/sales/paymentRoutes'),
    orders: require('./routes/sales/salesOrderRoutes'),
    variantImages: require('./routes/product/variantImage'),
    productWarranties: require('./routes/product/productWarranty'),
    productExpiries: require('./routes/product/productExpiry'),
    deliveries: require('./routes/delivery/deliveryRoutes'),
    priceRules: require('./routes/product/priceRules')
};

dotenv.config();

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 4000;

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    },
});

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    credentials: true
}));

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'user-actions.log' }),
    ],
});

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

    try {
        await Log.create(logEntry);
    } catch (error) {
        console.error('Failed to save log entry to database:', error);
    }

    next();
});

app.use((req, res, next) => {
    req.io = io;
    next();
});

// Use routes
Object.entries(routes).forEach(([key, route]) => {
    app.use(`/api/${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, route);
});

io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.token;
    if (!token) {
        return next(new Error('Authentication error'));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return next(new Error('Authentication error'));
        }
        socket.user = decoded;
        socket.request.socketId = socket.id;
        next();
    });
});

io.on('connection', (socket) => {
    socket.on('disconnect', () => {});
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
