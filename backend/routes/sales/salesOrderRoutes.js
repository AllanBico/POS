const express = require('express');
const router = express.Router();
const {
    SalesOrder,
    SalesOrderLineItem,
    Payment,
    Customer,
    Variant,  
    Product,
    User,
    Coupon,
    CouponRedemption, Category, Subcategory, Brand, Unit, ProductTax, VariantImage, PaymentMethod, StockMovement,
    Inventory,
    Composition
} = require('../../models/associations');
const authenticateToken = require("../../middleware/auth"); // Adjust path as needed

// Create a new Sales Order
router.post('/', authenticateToken, async (req, res) => {
    const transaction = await SalesOrder.sequelize.transaction();
    try {
        console.log('Received request body:', JSON.stringify(req.body, null, 2));

        // Validate request body
        if (!isValidSalesOrderRequest(req.body)) {
            console.log('Validation failed: Invalid request. Customer ID and at least one valid line item are required.');
            return res.status(400).json({message: 'Invalid request. Customer ID and at least one valid line item are required.'});
        }

        // Check and apply coupon if provided
        let appliedCoupon = null;
        if (req.body.couponCode) {
            console.log(`Attempting to apply coupon: ${req.body.couponCode}`);
            appliedCoupon = await applyCoupon(req.body.couponCode, req.body.total, {transaction});
            if (appliedCoupon.error) {
                console.log(`Error applying coupon: ${appliedCoupon.error}`);
                return res.status(400).json({message: appliedCoupon.error});
            }
            console.log(`Applied coupon: ${req.body.couponCode}. Discounted total: ${appliedCoupon.discountedTotal}`);
            req.body.total = appliedCoupon.discountedTotal;
        }

        // Create the sales order
        const salesOrder = await createSalesOrder(req.body, req.user.id, {transaction});
        console.log('Sales order created:', salesOrder.id);

        // Create line items
        await createLineItems(salesOrder.id, req.body.lineItems, {transaction});
        console.log('Line items created');

        // Update inventory and create stock movements
        await Promise.all(req.body.lineItems.map(async (item) => {
            console.log(`Updating stock for variant ID ${item.variantId}`);
            const variant = await Variant.findByPk(item.variantId, { include: [{ model: Product, as: 'Product' }] }); // Include Product model with alias
            console.log('variant', variant);
            if (!variant) {
                console.log(`Error: Variant with ID ${item.variantId} not found`);
                throw new Error(`Variant with ID ${item.variantId} not found`);
            }

            if (variant.Product.isComposition) { // Check if the product is a composition
                console.log('Product is a composition')
                const compositions = await Composition.findAll({
                    where: { productVariantId: variant.id },
                    include: [{ model: Variant, as: 'productVariant' }] // Include Product model with alias
                });

                for (const composition of compositions) {
                    const ingredientVariant = await Variant.findByPk(composition.ingredientVariantId);
                    if (!ingredientVariant) {
                        console.log(`Error: Ingredient variant with ID ${composition.ingredientVariantId} not found`);
                        throw new Error(`Ingredient variant with ID ${composition.ingredientVariantId} not found`);
                    }

                    const quantityToDecrement = composition.quantity * item.quantity; // Calculate total quantity to decrement
                    if (ingredientVariant.stockQuantity < quantityToDecrement) {
                        throw new Error('Insufficient stock for ingredient variant');
                    }

                    console.log('Decrementing stock for ingredient variant by', quantityToDecrement);
                    ingredientVariant.stockQuantity -= quantityToDecrement; // Update the local stock quantity
                    await ingredientVariant.save({ transaction }); // Save changes to ingredient variant

                    // Call the new function to decrement inventory for ingredient
                    await decrementInventory(ingredientVariant.id, quantityToDecrement, req.body.destinationType, req.body.destinationId, { transaction });
                    console.log(`Stock decremented for ingredient variant ID ${ingredientVariant.id} by ${quantityToDecrement}`);
                    await createStockMovement(ingredientVariant.id, -quantityToDecrement, { transaction }, req.user.id, req.body.destinationType, req.body.destinationId, 'client', salesOrder.id); // Record stock movement
                    console.log(`Stock movement recorded for ingredient variant ID ${ingredientVariant.id}`);
                }
            } else {
                // Existing logic for non-composition products
                if (item.quantity <= 0) {
                    throw new Error('Decrement amount must be positive');
                }
                if (variant.stockQuantity < item.quantity) {
                    throw new Error('Insufficient stock');
                }
                console.log('Decrementing stock by', item.quantity);
                variant.stockQuantity -= item.quantity; // Update the local stock quantity
                await variant.save({ transaction }); // Use save instead of update for better performance

                // Call the new function to decrement inventory with destinationType and destinationId
                await decrementInventory(item.variantId, item.quantity, req.body.destinationType, req.body.destinationId, { transaction });
                console.log(`Stock decremented for variant ID ${item.variantId} by ${item.quantity}`);
                await createStockMovement(variant.id, -item.quantity, { transaction }, req.user.id, req.body.destinationType, req.body.destinationId, 'client', salesOrder.id); // Record stock movement
                console.log(`Stock movement recorded for variant ID ${variant.id}`);
            }
        }));

        // Create payment
        const payment = await createPayment(salesOrder.id, req.user.id, req.body.total, req.body.paymentMethod, {transaction});
        console.log('Payment created:', payment.id);

        // Record coupon redemption if a coupon was applied
        if (appliedCoupon && appliedCoupon.coupon) {
            await recordCouponRedemption(appliedCoupon.coupon.id, salesOrder.id, appliedCoupon.discountAmount, {transaction});
            console.log('Coupon redemption recorded');

            // Update coupon usage count
            await Coupon.increment('usageCount', { 
                where: { id: appliedCoupon.coupon.id },
                transaction
            });
            console.log('Coupon usage count updated');
        }

        // Fetch the created order with its line items
        const createdOrder = await fetchCreatedOrder(salesOrder.id, {transaction});
        console.log('Created order fetched');

        await transaction.commit();

        res.status(201).json(createdOrder);
    } catch (error) {
        console.error('Error creating sales order:', error);
        await transaction.rollback();
        res.status(500).json({message: 'Error creating sales order', error: error.message});
    }
});

// Helper functions

async function createPayment(salesOrderId, userId, total, paymentMethod, {transaction}) {
    return await Payment.create({
        salesOrderId,
        amountPaid: total,
        paymentMethodId: paymentMethod,
        status: 'pending',
        transactionReference: null,
        createdBy: userId,
    }, {transaction});
}

function isValidSalesOrderRequest(body) {
    return body.lineItems &&
        Array.isArray(body.lineItems) &&
        body.lineItems.length > 0 &&
        body.lineItems.every(isValidLineItem);
}

function isValidLineItem(item) {
    return item.variantId &&
        item.quantity &&
        item.quantity > 0;
}

async function createSalesOrder(body, userId, {transaction}) {
    const {customer_id, total, status} = body;
    return await SalesOrder.create({
        customerId: customer_id,
        total,
        status,
        createdBy: userId,
        totalAmount: total,
        netTotal: total,
        userId: userId,
    }, {transaction});
}

async function createLineItems(salesOrderId, lineItems, {transaction}) {
    await Promise.all(lineItems.map(item =>
        SalesOrderLineItem.create({
            salesOrderId: salesOrderId,
            variantId: item.variantId,
            quantity: item.quantity,
            discount: item.discount,
            discountType: item.discountType,
            price: item.price,
            total: item.totalPrice,
        }, {transaction})
    ));
}

async function fetchCreatedOrder(salesOrderId, {transaction}) {
    return await SalesOrder.findByPk(salesOrderId, {
        include: [
            {model: SalesOrderLineItem, as: 'lineItems'},
            {model: Customer, as: 'customer'}
        ],
        transaction
    });
}

async function applyCoupon(couponCode, total, {transaction}) {
    const coupon = await Coupon.findOne({ where: { code: couponCode }, transaction });

    if (!coupon) {
        return {error: 'Invalid coupon code'};
    }

    if (coupon.status !== 'active' || new Date() > coupon.expiryDate) {
        return {error: 'Coupon is expired or inactive'};
    }

    if (coupon.minimumPurchaseAmount && total < coupon.minimumPurchaseAmount) {
        return {error: `Minimum purchase amount of ${coupon.minimumPurchaseAmount} not met`};
    }

    let discountAmount;
    if (coupon.discountType === 'percentage') {
        discountAmount = total * (coupon.discountValue / 100);
    } else {
        discountAmount = coupon.discountValue;
    }

    const discountedTotal = Math.max(total - discountAmount, 0);

    return {
        coupon,
        discountAmount,
        discountedTotal
    };
}

async function recordCouponRedemption(couponId, orderId, discountAmount, {transaction}) {
    await CouponRedemption.create({
        couponId,
        orderId,
        discountAmount,
        redemptionDate: new Date(),
        status: 'used'
    }, {transaction});
}

async function createStockMovement(variantId, quantityChange, {transaction}, createdBy, sourceType = 'store', sourceId = null, destinationType = 'store', destinationId = null) {
    console.log(`Creating stock movement: variantId=${variantId}, quantityChange=${quantityChange}, createdBy=${createdBy}, sourceType=${sourceType}, sourceId=${sourceId}, destinationType=${destinationType}, destinationId=${destinationId}`);
    
    const stockMovement = await StockMovement.create({
        variantId,
        quantity: quantityChange,
        transactionType: 'sales',
        sourceType, // e.g., 'store', 'warehouse', etc.
        sourceId, // ID of the source (e.g., store or warehouse)
        destinationType, // e.g., 'store', 'warehouse', etc.
        destinationId, // ID of the destination (e.g., store or warehouse)
        transactionDate: new Date(),
        createdBy, // ID of the user creating the movement
    }, {transaction});
    
    console.log(`Stock movement created: ${JSON.stringify(stockMovement)}`);
    return stockMovement;
}
async function decrementInventory(variantId, quantity, destinationType, destinationId, { transaction }) {
    const inventory = await Inventory.findOne({ 
        where: { 
            variantId, 
            ...(destinationType === 'warehouse' ? { warehouseId: destinationId } : { storeId: destinationId }) 
        }, 
        transaction 
    });
    
    if (!inventory) {
        throw new Error(`Inventory for variant ID ${variantId} not found in the specified location`);
    }
    if (inventory.quantity < quantity) {
        throw new Error('Insufficient inventory');
    }
    inventory.quantity -= quantity; // Decrement the quantity
    await inventory.save({ transaction });
    console.log(`Inventory decremented for variant ID ${variantId} by ${quantity} at ${destinationType} ID ${destinationId}`);
}

// Get all Sales Orders
router.get('/', authenticateToken, async (req, res) => {
    try {
        console.log('Fetching sales orders...');
        const salesOrders = await SalesOrder.findAll({
            include: [
                {model: Customer, as: 'customer'}
            ]
        });
        console.log(`Found ${salesOrders.length} sales orders`);
        res.status(200).json(salesOrders);
    } catch (error) {
        console.error('Error fetching sales orders:', error);
        res.status(500).json({message: 'Error fetching sales orders', error});
    }
});

// Get a specific Sales Order by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        console.log(`Fetching sales order with id: ${req.params.id}`);
        const salesOrder = await SalesOrder.findByPk(req.params.id, {
            include: [
                {
                    model: SalesOrderLineItem,
                    as: 'lineItems',
                    include: [{
                        model: Variant,
                        as: 'variant',
                        include: [
                            {
                                model: Product,
                                as: 'Product',
                                include: [
                                    { model: Category, as: 'category' },
                                    { model: Subcategory, as: 'subcategory' },
                                    { model: Brand, as: 'brand' },
                                    { model: Unit, as: 'Unit' },
                                    { model: ProductTax, as: 'taxes' }
                                ]
                            },
                            { model: VariantImage, as: 'images' }
                        ]
                    }]
                },
                { model: Customer, as: 'customer' },
                { model: User, as: 'user' },
                { 
                    model: Payment, 
                    as: 'payments',
                    include: [
                        { model: PaymentMethod, as: 'paymentMethod' },
                        { model: User, as: 'createdByUser' }
                    ]
                },
                { model: PaymentMethod, as: 'paymentMethod' },
                { 
                    model: CouponRedemption, 
                    include: [{ model: Coupon }]
                }
            ]
        });
        if (!salesOrder) {
            console.log(`Sales order with id ${req.params.id} not found`);
            return res.status(404).json({message: 'Sales order not found'});
        }
        console.log(`Successfully fetched sales order with id: ${req.params.id}`);
        res.status(200).json(salesOrder);
    } catch (error) {
        console.error('Error fetching sales order:', error);
        res.status(500).json({message: 'Error fetching sales order', error: error.message});
    }
});

// Update a Sales Order
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const updatedSalesOrder = await SalesOrder.update(req.body, {where: {id: req.params.id}});
        res.status(200).json(updatedSalesOrder);
    } catch (error) {
        res.status(500).json({message: 'Error updating sales order', error});
    }
});

// Delete a Sales Order
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const deleted = await SalesOrder.destroy({where: {id: req.params.id}});
        if (deleted) return res.status(204).json();
        res.status(404).json({message: 'Sales order not found'});
    } catch (error) {
        res.status(500).json({message: 'Error deleting sales order', error});
    }
});

router.post('/items/', authenticateToken, async (req, res) => {
    try {
        const lineItem = await SalesOrderLineItem.create(req.body);
        res.status(201).json(lineItem);
    } catch (error) {
        res.status(500).json({message: 'Error creating line item', error});
    }
});

// Get all Sales Order Line Items
router.get('/items/', authenticateToken, async (req, res) => {
    try {
        const lineItems = await SalesOrderLineItem.findAll();
        res.status(200).json(lineItems);
    } catch (error) {
        res.status(500).json({message: 'Error fetching line items', error});
    }
});

// Get a specific Sales Order Line Item by ID
router.get('/items/:id', authenticateToken, async (req, res) => {
    try {
        const lineItem = await SalesOrderLineItem.findByPk(req.params.id);
        if (!lineItem) return res.status(404).json({message: 'Line item not found'});
        res.status(200).json(lineItem);
    } catch (error) {
        res.status(500).json({message: 'Error fetching line item', error});
    }
});

// Update a Sales Order Line Item
router.put('/items/:id', authenticateToken, async (req, res) => {
    try {
        const updatedLineItem = await SalesOrderLineItem.update(req.body, {where: {id: req.params.id}});
        res.status(200).json(updatedLineItem);
    } catch (error) {
        res.status(500).json({message: 'Error updating line item', error});
    }
});

// Delete a Sales Order Line Item
router.delete('/items/:id', authenticateToken, async (req, res) => {
    try {
        const deleted = await SalesOrderLineItem.destroy({where: {id: req.params.id}});
        if (deleted) return res.status(204).json();
        res.status(404).json({message: 'Line item not found'});
    } catch (error) {
        res.status(500).json({message: 'Error deleting line item', error});
    }
});
module.exports = router;