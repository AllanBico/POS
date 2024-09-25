const express = require('express');
const router = express.Router();
const {
    Product, Variant, ProductTax, Category, Subcategory, Unit, Brand, VariantImage, Taxes,
    VariantAttributeValue,
    AttributeValue,
    Attribute, Inventory, Warehouse, Store
} = require('../../models/associations');
const authenticateToken = require("../../middleware/auth");
const sequelize = require('../../config/db');

router.post('/', authenticateToken, async (req, res) => {

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

        console.log("selectedTaxes", selectedTaxes);

        const errors = [];
        if (!name) errors.push({field: 'name', message: 'Name is required'});
        if (!description) errors.push({field: 'description', message: 'Description is required'});
        if (!categoryId) errors.push({field: 'categoryId', message: 'Category ID is required'});
        if (!subcategoryId) errors.push({field: 'subcategoryId', message: 'Subcategory ID is required'});
        if (!vatType) errors.push({field: 'vatType', message: 'VAT Type is required'});
        if (!brandId) errors.push({field: 'brandId', message: 'Brand ID is required'});
        if (!lowStockAlert) errors.push({field: 'lowStockAlert', message: 'Low Stock Alert is required'});
        if (!unitId) errors.push({field: 'unitId', message: 'Unit ID is required'});

        if (errors.length > 0) {
            return res.status(400).json({errors});
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

        res.status(201).json(productWithTaxes);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({error: error.message});
    }
});

// Create a Product
// router.post('/', authenticateToken, async (req, res) => {
//     try {
//         const {
//             name,
//             description,
//             categoryId,
//             subcategoryId,
//             vatType,
//             brandId,
//             lowStockAlert,
//             unitId,
//             isComposition,
//             selectedTaxes
//         } = req.body;
//         console.log("selectedTaxes", selectedTaxes)
//         const errors = [];
//         if (!name) errors.push({field: 'name', message: 'Name is required'});
//         if (!description) errors.push({field: 'description', message: 'Description is required'});
//         if (!categoryId) errors.push({field: 'categoryId', message: 'Category ID is required'});
//         if (!subcategoryId) errors.push({field: 'subcategoryId', message: 'Subcategory ID is required'});
//         if (!vatType) errors.push({field: 'vatType', message: 'VAT Type is required'});
//         if (!brandId) errors.push({field: 'brandId', message: 'Brand ID is required'});
//         if (!lowStockAlert) errors.push({field: 'lowStockAlert', message: 'Low Stock Alert is required'});
//         if (!unitId) errors.push({field: 'unitId', message: 'Unit ID is required'});
//
//         if (errors.length > 0) {
//             return res.status(400).json({errors});
//         }
//         const product = await Product.create({
//             name,
//             description,
//             categoryId,
//             subcategoryId,
//             vatType,
//             brandId,
//             lowStockAlert,
//             unitId,
//             isComposition
//         });
//         res.status(201).json(product);
//     } catch (error) {
//         res.status(500).json({error: error.message});
//     }
// });

// Get all Products
router.get('/', authenticateToken, async (req, res) => {


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
            res.status(404).json({error: 'Products not found'});
        } else {
            res.status(200).json(products);
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({error: error.message});
    }
});
// Get a Product by ID
router.get('/:id', authenticateToken, async (req, res) => {
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
            return res.status(404).json({error: 'Product not found'});
        }

        res.json(product);
    } catch (error) {
        console.error(`Error fetching product with id ${req.params.id}:`, error);
        res.status(500).json({error: 'Something went wrong'});
    }
});
// Update a Product
router.put('/:id', authenticateToken, async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const socketId = req.headers['x-socket-id'];  // Access the socketId from the request headers

        // You can now use the `socketId` for any additional logic (e.g., emitting events)
        console.log('Socket ID:', socketId);
        const {
            name, isComposition, description, categoryId, subcategoryId,
            vatType, brandId, lowStockAlert, unitId, selectedTaxes
        } = req.body;

        // Check if required fields are missing
        const missingFields = [];
        const requiredFields = { name, description, categoryId, subcategoryId, vatType, brandId, lowStockAlert, unitId };

        for (const [key, value] of Object.entries(requiredFields)) {
            if (!value) missingFields.push(key);
        }

        if (missingFields.length > 0) {
            await transaction.rollback();
            return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
        }

        // Attempt to update the product
        const updatedProduct = await Product.findOne({ where: { id: req.params.id }, transaction });

        if (!updatedProduct) {
            await transaction.rollback();
            console.error(`Error updating product with id ${req.params.id}: Product not found`);
            return res.status(404).json({ error: 'Product not found' });
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
        res.status(200).json(updatedProduct);

    } catch (error) {
        // Rollback transaction and handle the error
        if (transaction) await transaction.rollback();
        console.error(`Error updating product with id ${req.params.id}:`, error);
        res.status(500).json({ error: 'An error occurred while updating the product.' });
    }
});



// Delete a Product
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const deleted = await Product.destroy({
            where: {id: req.params.id}
        });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({error: 'Product not found'});
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});


module.exports = router;