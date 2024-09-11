const Product = require('./Product');
const Variant = require('./Variant');
const Category = require("./category");
const Subcategory = require("./subcategory");
const Brand = require("./brand");
const Unit = require("./unit");
const Attribute = require("./attribute");
const Warehouse = require("./warehouse");
const Store = require("./store");
const AttributeValue = require("./attributeValue");
const Inventory = require("./Inventory");
const VariantAttributeValue = require("./variantAttributeValue");
const ExpenseCategory = require('./ExpenseCategory');
const Expense = require('./Expense');
const PaymentMethod = require('./PaymentMethod');
const Supplier = require('./Supplier'); // Assuming you have a Supplier model
const User = require('./User'); // Assuming you have a User model
const SerialNumber = require('./SerialNumber'); // SerialNumber model
const StockMovement = require('./StockMovement'); // StockMovement model
const PurchaseOrder = require('./PurchaseOrder'); // PurchaseOrder model
const PurchaseOrderLineItem = require('./PurchaseOrderLineItem'); // PurchaseOrderLineItem model

// Define associations AFTER model initialization

// Product <-> Variant
Product.hasMany(Variant, {foreignKey: 'productId', as: 'variants'});
Variant.belongsTo(Product, {foreignKey: 'productId', as: 'Product'});

// Product relationships
Product.belongsTo(Category, {as: 'category', foreignKey: 'categoryId'});
Product.belongsTo(Subcategory, {as: 'subcategory', foreignKey: 'subcategoryId'});
Product.belongsTo(Brand, {as: 'brand', foreignKey: 'brandId'});
Product.belongsTo(Unit, {as: 'Unit', foreignKey: 'unitId'});

// Category <-> Subcategory
Category.hasMany(Subcategory, {foreignKey: 'categoryId', onDelete: 'CASCADE'});
Subcategory.belongsTo(Category, {foreignKey: 'categoryId'});

// Attribute <-> AttributeValue
Attribute.hasMany(AttributeValue, {foreignKey: 'attributeId', as: 'attributeValues'});
AttributeValue.belongsTo(Attribute, {foreignKey: 'attributeId', as: 'attribute'});

// Variant <-> VariantAttributeValue
Variant.hasMany(VariantAttributeValue, {foreignKey: 'variantId', as: 'variantAttributeValues'});
VariantAttributeValue.belongsTo(Variant, {foreignKey: 'variantId', as: 'variant'});

// AttributeValue <-> VariantAttributeValue
AttributeValue.hasMany(VariantAttributeValue, {foreignKey: 'attributeValueId', as: 'attributeValueVariants'});
VariantAttributeValue.belongsTo(AttributeValue, {foreignKey: 'attributeValueId', as: 'attributeValue'});

// Inventory <-> Variant, Warehouse, Store
Inventory.belongsTo(Variant, {foreignKey: 'variantId', as: 'InventoryVariants'});
Inventory.belongsTo(Warehouse, {foreignKey: 'warehouseId', as: 'warehouse'});
Inventory.belongsTo(Store, {foreignKey: 'storeId', as: 'store'});

// Expense relationships
Expense.belongsTo(ExpenseCategory, {foreignKey: 'expenseCategoryId', as: 'expenseCategory'});
Expense.belongsTo(PaymentMethod, {foreignKey: 'paymentMethodId', as: 'paymentMethod'});
Expense.belongsTo(User, {foreignKey: 'paidById', as: 'paidBy'});
Expense.belongsTo(Supplier, {foreignKey: 'supplierId', as: 'supplier'});

// Serial Number <-> Variant
Variant.hasMany(SerialNumber, {foreignKey: 'variantId', as: 'serialNumbers'});
SerialNumber.belongsTo(Variant, {foreignKey: 'variantId', as: 'variant'});

// Serial Number <-> StockMovement
SerialNumber.belongsTo(StockMovement, {foreignKey: 'stockMovementId', as: 'stockMovement'});
StockMovement.hasMany(SerialNumber, {foreignKey: 'stockMovementId', as: 'serialNumbers'});

// Stock Movement relationships
StockMovement.belongsTo(Variant, {foreignKey: 'variantId', as: 'variant'});
StockMovement.belongsTo(User, {foreignKey: 'userId', as: 'user'});

// Store and Warehouse relationships with StockMovement
StockMovement.belongsTo(Warehouse, {foreignKey: 'sourceWarehouseId', as: 'sourceWarehouse'});
StockMovement.belongsTo(Warehouse, {foreignKey: 'destinationWarehouseId', as: 'destinationWarehouse'});
StockMovement.belongsTo(Store, {foreignKey: 'sourceStoreId', as: 'sourceStore'});
StockMovement.belongsTo(Store, {foreignKey: 'destinationStoreId', as: 'destinationStore'});

PurchaseOrder.hasMany(PurchaseOrderLineItem, {foreignKey: 'purchaseOrderId', as: 'lineItems', onDelete: 'CASCADE'});
PurchaseOrderLineItem.belongsTo(PurchaseOrder, {foreignKey: 'purchaseOrderId', as: 'purchaseOrder'});

PurchaseOrderLineItem.belongsTo(Variant, {foreignKey: 'variantId', as: 'variant'});

PurchaseOrder.belongsTo(Supplier, {foreignKey: 'supplierId', as: 'supplier'});
PurchaseOrder.belongsTo(Warehouse, {foreignKey: 'warehouseId', as: 'warehouse'});
PurchaseOrder.belongsTo(Store, {foreignKey: 'storeId', as: 'store'});

module.exports = {
    Product,
    Variant,
    Brand,
    Category,
    Subcategory,
    Unit,
    Attribute,
    AttributeValue,
    Inventory,
    VariantAttributeValue,
    Warehouse,
    Store,
    ExpenseCategory,
    Expense,
    PaymentMethod,
    Supplier,
    User,
    SerialNumber,
    StockMovement,
    PurchaseOrderLineItem,
    PurchaseOrder
};
