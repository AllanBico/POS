
const { Product, Variant, Category, Subcategory, Brand, Unit, Attribute, AttributeValue, Inventory,  VariantAttributeValue, Warehouse, Store } = require('./models/associations');

async function testWrite() {
    try {
        const variantId = 35;
        const warehouseId = 3;
        const storeId = null;
        const quantity = 10;
        const minimumStock = 5;
        const reorderPoint = 7;
        const costPrice = 12.99;
        const newInventory = await Inventory.create({
            variantId,
            warehouseId,
            storeId,
            quantity,
            minimumStock,
            reorderPoint,
            costPrice,
        });
        console.log("newInventory",newInventory)
    } catch (error) {
        console.error('Error writing data:', error);
    }
}

testWrite();
