const express = require('express');
const { Product, Variant, ProductTax, Category, Subcategory, Unit, Brand, VariantImage, Taxes,
    VariantAttributeValue,
    AttributeValue,
    Attribute, Inventory, Warehouse, Store
} = require('../../models/associations');
const authenticateToken = require("../../middleware/auth");
const { ValidationError, Op } = require('sequelize');
const sequelize = require('../../config/db');
const router = express.Router();

// Utility function to handle async routes
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Validate product input
const validateProductInput = (name,  categoryId,  brandId, lowStockAlert, unitId) => {
    const errors = [];
    if (!name) errors.push({field: 'name', message: 'Name is required'});
    if (!categoryId) errors.push({field: 'categoryId', message: 'Category is required'});
    if (!brandId) errors.push({field: 'brandId', message: 'Brand  is required'});
    if (!lowStockAlert) errors.push({field: 'lowStockAlert', message: 'Low Stock Alert is required'});
    if (!unitId) errors.push({field: 'unitId', message: 'Unit is required'});
    if (errors.length > 0) {
        console.log('Validation errors:', errors); // Log the errors
        const error = new Error('Invalid product input');
        error.status = 400;
        error.errors = errors;
        return error;
    }

};

// Emit socket event to all clients except the sender
const emitToOthers = (req, event, data) => {
    try {
        const socketId = req.headers['x-socket-id'];
        if (req.io && typeof req.io.emit === 'function') {
            req.io.emit(event, data, { except: socketId });
        }
    } catch (error) {
        console.error('Error emitting socket event:', error);
    }
};

// Middleware for handling 400 and 500 errors
const handleError = (err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        status: err.status || 500
    });
};

const checkDuplicateName = async (name, id = null) => {
    const whereClause = {
        name: { [Op.iLike]: name.toLowerCase() }
    };
    if (id) {
        whereClause.id = { [Op.ne]: id };
    }
    const existingProduct = await Product.findOne({ where: whereClause });
    return !!existingProduct;
};

// Create a product
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const {
            name,
            description,
            categoryId,
            subcategoryId,
            vatType,
            brandId,
            lowStockAlert,
            unitId,
            isComposition,
            selectedTaxes
        } = req.body;

        console.log('req.body', req.body); // Log the request body for debugging

        const validationError = validateProductInput(name,  categoryId,  brandId, lowStockAlert, unitId);
        if (validationError) {
            return res.status(400).json({ message: validationError.errors.map(error => error.message).join(', ') });
        }
        const isDuplicate = await checkDuplicateName(name); // Check for duplicate
        if (isDuplicate) {
            return res.status(400).json({ message: 'Product with this name already exists' });
        }
        // Create the product
        const product = await Product.create({
            name,
            description,
            categoryId,
            subcategoryId,
            vatType,
            brandId,
            lowStockAlert,
            unitId,
            isComposition
        });

        console.log('product', product); // Log the created product for debugging

        // Save selected taxes
        if (selectedTaxes && Array.isArray(selectedTaxes)) {
            console.log('product.id', product.id)
            const productTaxes = selectedTaxes.map((tax, index) => ({
                productId: product.id,
                taxId: tax.value,
                priority: index,
            }));

            await ProductTax.bulkCreate(productTaxes);
        }

        // Fetch the product with associated taxes
        const productWithTaxes = await Product.findByPk(product.id, {
            include: [{model: ProductTax, as: 'taxes'}]
        });

        console.log('productWithTaxes', productWithTaxes); // Log the product with taxes for debugging

        res.status(201).json({ data: { value: productWithTaxes }, message: 'Product created successfully' });
        emitToOthers(req, 'newProduct', productWithTaxes);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({message: error.message});
    }
}));

// Get all Products
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const socketId = req.headers['x-socket-id'];  // Access the socketId from the request headers

        // You can now use the `socketId` for any additional logic (e.g., emitting events)
        console.log('Socket ID:', socketId);
        const products = await Product.findAll({
            include: [
                {model: Variant, as: 'variants'},
                {model: Category, as: 'category'},
                {model: Subcategory, as: 'subcategory'},
                {model: Unit, as: 'Unit'},
                {model: Brand, as: 'brand'}
            ]
        });
        if (!products) {
            console.error('Error fetching products:', error);
            res.status(404).json({message: 'Products not found'});
        } else {
            res.status(200).json({ data: { value: products }, message: 'Products fetched successfully' });
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({message: error.message});
    }
}));
// Get a Product by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const productId = req.params.id;

        // Fetch product data with associations
        const product = await Product.findByPk(productId, {
            include: [
                {
                    model: Variant, as: 'variants', include: [{model: VariantImage, as: 'images'}, {
                        model: VariantAttributeValue,
                        as: 'variantAttributeValues',
                        include: [
                            {
                                model: AttributeValue, as: 'attributeValue', attributes: ['id', 'value'],
                                include: [
                                    {model: Attribute, as: 'attribute', attributes: ['id', 'name']}
                                ]
                            }
                        ]
                    },{model: Inventory, as: 'InventoryVariants',include: [{model: Warehouse, as: 'warehouse'}, {model: Store, as: 'store'}]}],
                },
                {model: Category, as: 'category'},
                {model: Subcategory, as: 'subcategory'},
                {model: Brand, as: 'brand'},
                {model: Unit, as: 'Unit'},
                {model: ProductTax, as: 'taxes', include: [{model: Taxes, as: 'Tax'}]}
            ]
        });

        if (!product) {
            console.error(`Error fetching product with id ${productId}: Product not found`);
            return res.status(404).json({message: 'Product not found'});
        }

        res.status(200).json({ data: { value: product }, message: 'Product fetched successfully' });
    } catch (error) {
        console.error(`Error fetching product with id ${req.params.id}:`, error);
        res.status(500).json({message: 'Something went wrong'});
    }
}));
// Update a Product
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const socketId = req.headers['x-socket-id'];  // Access the socketId from the request headers

        // You can now use the `socketId` for any additional logic (e.g., emitting events)
        console.log('Socket ID:', socketId);
        const {
            name, isComposition, description, categoryId, subcategoryId,
            vatType, brandId, lowStockAlert, unitId, selectedTaxes
        } = req.body;

        const validationError = validateProductInput(name,  categoryId,  brandId, lowStockAlert, unitId);
        if (validationError) {
            return res.status(400).json({ message: validationError.errors.map(error => error.message).join(', ') });
        }

        const isDuplicate = await checkDuplicateName(name); // Check for duplicate
        if (isDuplicate) {
            return res.status(400).json({ message: 'Product with this name already exists' });
        }
        // Attempt to update the product
        const updatedProduct = await Product.findOne({ where: { id: req.params.id }, transaction });

        if (!updatedProduct) {
            await transaction.rollback();
            console.error(`Error updating product with id ${req.params.id}: Product not found`);
            return res.status(404).json({ message: 'Product not found' });
        }

        await updatedProduct.update({
            name, description, price: 0, categoryId, subcategoryId, vatType,
            brandId, lowStockAlert, unitId, isComposition
        }, { transaction });

        // Handle taxes if provided
        if (Array.isArray(selectedTaxes)) {
            // Fetch existing taxes associated with the product
            const existingTaxes = await ProductTax.findAll({
                where: { productId: updatedProduct.id },
                transaction
            });

            const existingTaxIds = existingTaxes.map(tax => tax.taxId);
            const newTaxes = selectedTaxes.filter(tax => !existingTaxIds.includes(tax.value));
            const taxesToKeep = selectedTaxes.map(tax => tax.value);
            const taxesToUpdate = existingTaxes.filter(tax => taxesToKeep.includes(tax.taxId));

            // Update existing taxes
            for (const tax of taxesToUpdate) {
                const updatedTax = selectedTaxes.find(t => t.value === tax.taxId);
                await tax.update({ priority: selectedTaxes.indexOf(updatedTax) }, { transaction });
            }

            // Create new taxes
            if (newTaxes.length > 0) {
                const taxesToCreate = newTaxes.map((tax, index) => ({
                    productId: updatedProduct.id,
                    taxId: tax.value || null,
                    priority: index
                }));
                console.log("taxesToCreate", taxesToCreate);
                await ProductTax.bulkCreate(taxesToCreate.filter(tax => tax.taxId !== null), { transaction });
            }

            // Remove taxes that are no longer associated with the product
            const taxesToRemove = existingTaxes.filter(tax => !taxesToKeep.includes(tax.taxId));
            for (const tax of taxesToRemove) {
                await tax.destroy({ transaction });
            }
        }

        // Commit the transaction
        await transaction.commit();
        res.status(200).json({ data: { value: updatedProduct }, message: 'Product updated successfully' });
        emitToOthers(req, 'updateProduct', updatedProduct);

    } catch (error) {
        // Rollback transaction and handle the error
        if (transaction) await transaction.rollback();
        console.error(`Error updating product with id ${req.params.id}:`, error);
        res.status(500).json({ message: 'An error occurred while updating the product.' });
    }
}));



// Delete a Product
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const deleted = await Product.destroy({
            where: {id: req.params.id}
        });
        if (deleted) {
            res.status(200).json({ message: 'Product deleted successfully' });
            emitToOthers(req, 'deleteProduct', req.params.id);
        } else {
            res.status(404).json({message: 'Product not found'});
        }
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}));


// Error handling middleware
router.use(handleError);

module.exports = router;