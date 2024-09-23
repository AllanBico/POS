const express = require('express');
const router = express.Router();
const {Product, Variant, ProductTax} = require('../../models/associations');
const authenticateToken = require("../../middleware/auth");


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
            console.log('product.id',product.id)
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
        console.log("selectedTaxes", selectedTaxes)
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
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Get all Products
router.get('/', authenticateToken, async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [{model: Variant, as: 'variants'}] // Include variants with each product
        });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Get a Product by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [{model: Variant, as: 'variants'}] // Include variants with the product
        });
        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({error: 'Product not found'});
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Update a Product
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const {name, description, price, sku, categoryId, subCategoryId, vatType} = req.body;
        const [updated] = await Product.update({
            name,
            description,
            price,
            sku,
            categoryId,
            subCategoryId,
            vatType,
            brandId,
            lowStockAlert,
            unitId
        }, {
            where: {id: req.params.id}
        });
        if (updated) {
            const updatedProduct = await Product.findByPk(req.params.id);
            res.status(200).json(updatedProduct);
        } else {
            res.status(404).json({error: 'Product not found'});
        }
    } catch (error) {
        res.status(500).json({error: error.message});
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