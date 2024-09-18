const express = require('express');
const router = express.Router();
const {User,StockAdjustment, StockTake, Warehouse, Store, Variant, Product, Unit, Inventory, StockMovement,
    SerialNumber
} = require('../../models/associations');
const authenticateToken = require("../../middleware/auth");
const {literal} = require("../../config/db");
const sequelize = require('../../config/db');
// Create a new stock adjustment
router.post('/',authenticateToken, async (req, res) => {
    const { variantId, storeId, warehouseId, adjustmentQuantity, reason, createdBy,type,stockTakeId,serialNumbers } = req.body;
    console.log("variantId, storeId, warehouseId, adjustmentQuantity, reason, createdBy,stockTakeId,serialNumbers",variantId, storeId, warehouseId, adjustmentQuantity, reason, createdBy,type,stockTakeId,serialNumbers)
    try {
        const newAdjustment = await StockAdjustment.create({
            variantId,
            storeId,
            stockTakeId,
            warehouseId,
            adjustmentQuantity,
            reason,
            createdBy:req.user.id,
            type,
            serialNumbers: serialNumbers.join(',')
        });
        res.status(201).json(newAdjustment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the stock adjustment' });
    }
});

// Get all stock adjustments
router.get('/', authenticateToken, async (req, res) => {
    try {
        const stockAdjustments = await StockAdjustment.findAll({
            include: [
                {
                    model: Variant,
                    as: 'variant',
                    attributes: ['id', 'sku', 'price'],
                    include: [
                        {
                            model: Product,
                            as: 'Product',
                            attributes: ['id', 'name'],
                            include: [
                                {
                                    model: Unit,
                                    as: 'Unit',
                                    attributes: ['abbreviation', 'name'],
                                }
                            ],
                        }
                    ],
                },
                {
                    model: User,
                    as: 'createdByUser',
                    attributes: ['id', 'name'],
                },
                {
                    model: User,
                    as: 'approvedByUser',
                    attributes: ['id', 'name'],
                },
                {
                    model: Store,
                    as: 'store',
                    attributes: ['id', 'name'],
                },
                {
                    model: Warehouse,
                    as: 'warehouse',
                    attributes: ['id', 'name'],
                },
                {
                    model: StockTake,
                    as: 'stockTake',
                    attributes: ['id', 'systemQuantity', 'physicalQuantity', 'difference', 'date', 'status'],
                    include: [
                        {
                            model: Variant,
                            as: 'variant',
                            attributes: ['id', 'sku'],
                            include: [
                                {
                                    model: Product,
                                    as: 'Product',
                                    attributes: ['name'],
                                    include: [
                                        {
                                            model: Unit,
                                            as: 'Unit',
                                            attributes: ['abbreviation'],
                                        }
                                    ],
                                }
                            ],
                        },
                        {
                            model: Store,
                            as: 'store',
                            attributes: ['name'],
                        },
                        {
                            model: Warehouse,
                            as: 'warehouse',
                            attributes: ['name'],
                        }
                    ],
                }
            ],
            attributes: ['id', 'variantId', 'storeId', 'warehouseId', 'stockTakeId', 'adjustmentQuantity', 'reason', 'status', 'date','type'],
        });
        res.status(200).json(stockAdjustments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching stock adjustments' });
    }
});

// Get a single stock adjustment by ID
router.get('/:id',authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const adjustment = await StockAdjustment.findByPk(id, {
            include: [
                'variant',
                'store',
                'warehouse',
                {
                    model: User,
                    as: 'createdByUser',
                },
                {
                    model: User,
                    as: 'approvedByUser',
                }
            ],
        });

        if (!adjustment) {
            return res.status(404).json({ error: 'Stock adjustment not found' });
        }

        res.status(200).json(adjustment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the stock adjustment' });
    }
});

// Update a stock adjustment by ID
router.put('/:id',authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { variantId, storeId, warehouseId, adjustmentQuantity, reason, status, approvedBy } = req.body;

    try {
        const adjustment = await StockAdjustment.findByPk(id);

        if (!adjustment) {
            return res.status(404).json({ error: 'Stock adjustment not found' });
        }

        adjustment.variantId = variantId || adjustment.variantId;
        adjustment.storeId = storeId || adjustment.storeId;
        adjustment.warehouseId = warehouseId || adjustment.warehouseId;
        adjustment.adjustmentQuantity = adjustmentQuantity || adjustment.adjustmentQuantity;
        adjustment.reason = reason || adjustment.reason;
        adjustment.status = status || adjustment.status;
        adjustment.approvedBy = approvedBy || adjustment.approvedBy;

        await adjustment.save();
        res.status(200).json(adjustment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while updating the stock adjustment' });
    }
});

// Delete a stock adjustment by ID
router.delete('/:id',authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const adjustment = await StockAdjustment.findByPk(id);

        if (!adjustment) {
            return res.status(404).json({ error: 'Stock adjustment not found' });
        }

        await adjustment.destroy();
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while deleting the stock adjustment' });
    }
});



router.post('/:id/approve', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { user } = req; // Destructure user from req object

    const transaction = await sequelize.transaction(); // Start a transaction

    try {
        const adjustment = await StockAdjustment.findByPk(id, { transaction });

        if (!adjustment) {
            return res.status(404).json({ error: 'Stock adjustment not found' });
        }

        // Update adjustment status
        adjustment.status = 'approved';
        adjustment.approvedBy = user.id;
        await adjustment.save({ transaction });

        // Create a stock movement record
        const stock_movement = await StockMovement.create({
            variantId: adjustment.variantId,
            destinationStoreId: adjustment?.storeId,
            transactionType: 'adjustment',
            destinationWarehouseId: adjustment?.warehouseId,
            sourceId: adjustment.id,
            quantity: adjustment.adjustmentQuantity,
            type: adjustment.type,
            notes: adjustment.reason,
            date: new Date(),
            createdBy: user.id,
        }, { transaction });

        // Perform calculations based on the type
        if (adjustment.type === 'stock in') {
            // Add to inventory
            await Inventory.update(
                { quantity: literal(`quantity + ${adjustment.adjustmentQuantity}`) },
                { where: { storeId: adjustment.storeId, warehouseId: adjustment.warehouseId, variantId: adjustment.variantId }, transaction }
            );

            // Add serial numbers to the database
            const serialNumbers = adjustment.serialNumbers.split(','); // Split serial numbers by comma
            const serialNumbersToAdd = serialNumbers.map(sn => ({
                serialNumber: sn.trim(), // Trim whitespace
                variantId: adjustment.variantId,
                stockMovementId: stock_movement.id,
            }));
            await SerialNumber.bulkCreate(serialNumbersToAdd, { transaction });
        } else if (adjustment.type === 'stock out') {
            // Remove from inventory
            await Inventory.update(
                { quantity: literal(`quantity - ${adjustment.adjustmentQuantity}`) },
                { where: { storeId: adjustment.storeId, warehouseId: adjustment.warehouseId, variantId: adjustment.variantId }, transaction }
            );

            // Remove serial numbers from the database
            const serialNumbersToRemove = adjustment.serialNumbers.split(','); // Split serial numbers by comma
            await SerialNumber.destroy({
                where: {
                    serialNumber: serialNumbersToRemove.map(sn => sn.trim()), // Trim whitespace
                    variantId: adjustment.variantId,
                },
                transaction
            });
        }

        // Update variant quantity
        const variant = await Variant.findByPk(adjustment.variantId, { transaction });
        if (variant) {
            variant.stockQuantity += (adjustment.type === 'stock in' ? adjustment.adjustmentQuantity : -adjustment.adjustmentQuantity);
            await variant.save({ transaction });
        }

        await transaction.commit(); // Commit the transaction
        res.status(200).json(adjustment);
    } catch (error) {
        await transaction.rollback(); // Rollback the transaction on error
        console.error(error);
        res.status(500).json({ error: 'An error occurred while approving the stock adjustment' });
    }
});



module.exports = router;
