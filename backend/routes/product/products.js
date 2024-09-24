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
        const {
            name, isComposition, description, categoryId, subcategoryId,
            vatType, brandId, lowStockAlert, unitId, selectedTaxes
        } = req.body;

        // Validate required fields
        const requiredFields = { name, description, categoryId, subcategoryId, vatType, brandId, lowStockAlert, unitId };
        for (const [key, value] of Object.entries(requiredFields)) {
            if (value === undefined || value === null) {
                await transaction.rollback(); // Ensure rollback on error
                return res.status(400).json({ error: `Missing required field: ${key}` });
            }
        }

        // Update product
        const [updatedCount, [updatedProduct]] = await Product.update({
            name, description, price: 0, categoryId, subcategoryId, vatType,
            brandId, lowStockAlert, unitId, isComposition
        }, {
            where: { id: req.params.id },
            returning: true,
            transaction
        });

        if (updatedCount === 0) {
            await transaction.rollback(); // Ensure rollback if no product is updated
            return res.status(404).json({ error: 'Product not found' });
        }

        // Handle taxes if provided
        if (Array.isArray(selectedTaxes)) {
            const existingTaxes = await ProductTax.findAll({
                where: { productId: updatedProduct.id },
                transaction
            });

            const taxesToKeep = new Set();
            const taxesToCreate = [];
            const taxesToUpdate = [];

            // Identify taxes to create or update
            selectedTaxes.forEach((tax, index) => {
                const existingTax = existingTaxes.find(et => et.taxId === tax.value);
                if (existingTax) {
                    taxesToUpdate.push({ ...existingTax, priority: index });
                    taxesToKeep.add(existingTax.id);
                } else {
                    taxesToCreate.push({
                        productId: updatedProduct.id,
                        taxId: tax.value,
                        priority: index
                    });
                }
            });

            // Execute tax operations within a try-catch block
            try {
                await Promise.all([
                    ProductTax.bulkCreate(taxesToCreate, { transaction }), // Create new taxes
                    ...taxesToUpdate.map(tax => tax.save({ transaction })), // Update existing taxes
                    ProductTax.destroy({ // Remove taxes not in selected list
                        where: {
                            productId: updatedProduct.id,
                            id: { [Op.notIn]: Array.from(taxesToKeep) }
                        },
                        transaction
                    })
                ]);
            } catch (bulkError) {
                // Catch bulk insert/update errors
                console.error('Error during bulk tax operations:', bulkError);
                await transaction.rollback();
                return res.status(500).json({ error: 'Failed to update product taxes.' });
            }
        }

        // Commit transaction if everything is successful
        await transaction.commit();
        res.status(200).json(updatedProduct);
    } catch (error) {
        // Ensure rollback only happens once
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