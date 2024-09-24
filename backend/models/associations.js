const Product = require('./product/product');
const Variant = require('./product/variant');
const Category = require("./product/category");
const Subcategory = require("./product/subcategory");
const Brand = require("./product/brand");
const Unit = require("./product/unit");
const Attribute = require("./product/attribute");
const Warehouse = require("./warehouse");
const Store = require("./store");
const AttributeValue = require("./product/attributeValue");
const Inventory = require("./inventory/Inventory");
const VariantAttributeValue = require("./product/variantAttributeValue");
const ExpenseCategory = require('./expenses/ExpenseCategory');
const Expense = require('./expenses/Expense');
const PaymentMethod = require('./PaymentMethod');
const Supplier = require('./product/supplier'); // Assuming you have a Supplier model
const User = require('./users/user'); // Assuming you have a User model
const SerialNumber = require('./inventory/SerialNumber'); // SerialNumber model
const StockMovement = require('./inventory/StockMovement'); // StockMovement model
const PurchaseOrder = require('./purchases/purchaseOrder'); // PurchaseOrder model
const PurchaseOrderLineItem = require('./purchases/purchaseOrderLineItem'); // PurchaseOrderLineItem model
const GoodsReceived = require('./inventory/goodsReceivedNote');
const GoodsReceivedLineItem = require('./inventory/goodsReceivedLineItem');
const Role = require('./users/Role');
const Permission = require('./users/Permission');
const RolePermission = require('./users/RolePermission');
const UserRole  = require('./users/userRole');
const Warranty  = require('./product/warranty');
const Taxes  = require('./Taxes');
const StockTake  = require('./inventory/StockTake');
const Model = require('./Model'); // Import the Model
const StockAdjustment = require('./inventory/stockAdjustment');
const Coupon = require('./Coupon');
const Composition =require('./product/Composition')
const SalesOrder = require('./sales/salesOrder')
const Customer = require('./customer')
const SalesOrderLineItem = require('./sales/salesOrderLineItem')
const VariantImage = require('./product/VariantImage')
const Payment = require('./sales/Payment')
const ProductTax = require('./ProductTax')
// Define associations AFTER model initialization

// SalesOrder <-> Customer
SalesOrder.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Customer.hasMany(SalesOrder, { foreignKey: 'customerId', as: 'salesOrders' });

// SalesOrder <-> User (who created the sales order)
SalesOrder.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(SalesOrder, { foreignKey: 'userId', as: 'salesOrders' });

// SalesOrder <-> PaymentMethod
SalesOrder.belongsTo(PaymentMethod, { foreignKey: 'paymentMethodId', as: 'paymentMethod' });
PaymentMethod.hasMany(SalesOrder, { foreignKey: 'paymentMethodId', as: 'salesOrders' });

// SalesOrder <-> SalesOrderLineItem
SalesOrder.hasMany(SalesOrderLineItem, { foreignKey: 'salesOrderId', as: 'lineItems' });
SalesOrderLineItem.belongsTo(SalesOrder, { foreignKey: 'salesOrderId', as: 'salesOrder' });

// SalesOrderLineItem <-> Variant
SalesOrderLineItem.belongsTo(Variant, { foreignKey: 'variantId', as: 'variant' });
Variant.hasMany(SalesOrderLineItem, { foreignKey: 'variantId', as: 'lineItems' });

// Payment <-> SalesOrder
Payment.belongsTo(SalesOrder, { foreignKey: 'salesOrderId', as: 'salesOrder' });
SalesOrder.hasMany(Payment, { foreignKey: 'salesOrderId', as: 'payments' });

// Payment <-> PaymentMethod
Payment.belongsTo(PaymentMethod, { foreignKey: 'paymentMethodId', as: 'paymentMethod' });
PaymentMethod.hasMany(Payment, { foreignKey: 'paymentMethodId', as: 'payments' });

// Payment <-> User (who created the payment)
Payment.belongsTo(User, { foreignKey: 'createdBy', as: 'createdByUser' });
User.hasMany(Payment, { foreignKey: 'createdBy', as: 'createdPayments' });

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
Variant.hasMany(Inventory, { foreignKey: 'variantId', as: 'InventoryVariants' });
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
StockMovement.belongsTo(User, {foreignKey: 'CreatedBy', as: 'user'});

// Store and Warehouse relationships with StockMovement
StockMovement.belongsTo(Warehouse, {foreignKey: 'sourceWarehouseId', as: 'sourceWarehouse'});
StockMovement.belongsTo(Warehouse, {foreignKey: 'destinationWarehouseId', as: 'destinationWarehouse'});
StockMovement.belongsTo(Store, {foreignKey: 'sourceStoreId', as: 'sourceStore'});
StockMovement.belongsTo(Store, {foreignKey: 'destinationStoreId', as: 'destinationStore'});

// Purchase Order -> Goods Received (One-to-Many)
PurchaseOrder.hasMany(GoodsReceived, { as: 'goodsReceived', foreignKey: 'purchaseOrderId' });
GoodsReceived.belongsTo(PurchaseOrder, { as: 'purchaseOrder', foreignKey: 'purchaseOrderId' });
PurchaseOrder.hasMany(PurchaseOrderLineItem, {foreignKey: 'purchaseOrderId', as: 'lineItems', onDelete: 'CASCADE'});
PurchaseOrderLineItem.belongsTo(PurchaseOrder, {foreignKey: 'purchaseOrderId', as: 'purchaseOrder'});

PurchaseOrderLineItem.belongsTo(Variant, {foreignKey: 'variantId', as: 'variant'});

PurchaseOrder.belongsTo(Supplier, {foreignKey: 'supplierId', as: 'supplier'});
PurchaseOrder.belongsTo(Warehouse, {foreignKey: 'warehouseId', as: 'warehouse'});
PurchaseOrder.belongsTo(Store, {foreignKey: 'storeId', as: 'store'});

// Warehouse -> Goods Received (One-to-Many)
Warehouse.hasMany(GoodsReceived, { as: 'goodsReceived', foreignKey: 'warehouseId' });
GoodsReceived.belongsTo(Warehouse, { as: 'warehouse', foreignKey: 'warehouseId' });


// Store -> Goods Received (One-to-Many)
Store.hasMany(GoodsReceived, { as: 'goodsReceived', foreignKey: 'storeId' });
GoodsReceived.belongsTo(Store, { as: 'store', foreignKey: 'storeId' });

// GoodsReceived -> GoodsReceivedLineItem (One-to-Many)
GoodsReceived.hasMany(GoodsReceivedLineItem, { as: 'lineItems', foreignKey: 'goodsReceivedId' });
GoodsReceivedLineItem.belongsTo(GoodsReceived, { as: 'goodsReceived', foreignKey: 'goodsReceivedId' });

Variant.hasMany(GoodsReceivedLineItem, { as: 'goodsReceivedLineItems', foreignKey: 'variantId' });
GoodsReceivedLineItem.belongsTo(Variant, { as: 'variant', foreignKey: 'variantId' });
Permission.belongsTo(Model, { as: 'Model', foreignKey: 'modelId' });
Model.hasMany(Permission, { as: 'Permission', foreignKey: 'modelId' });

User.belongsToMany(Role, { through: UserRole });
Role.belongsToMany(User, { through: UserRole });

// Role <-> Permission association
Role.belongsToMany(Permission, { through: RolePermission });
Permission.belongsToMany(Role, { through: RolePermission });

Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'RoleId' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'PermissionId' });

// StockTake <-> Product (each stock take is associated with a product)
StockTake.belongsTo(Variant, { foreignKey: 'variant_id', as: 'variant' });
Variant.hasMany(StockTake, { foreignKey: 'variant_id', as: 'stockTakes' });

// StockTake <-> Store (optional association, stock take can happen in a store)
StockTake.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
Store.hasMany(StockTake, { foreignKey: 'store_id', as: 'stockTakes' });

// StockTake <-> Store (optional association, stock take can happen in a store)
StockTake.belongsTo(Warehouse, { foreignKey: 'warehouse_id', as: 'warehouse' });
Warehouse.hasMany(StockTake, { foreignKey: 'warehouse_id', as: 'stockTakes' });

StockTake.belongsTo(User, { foreignKey: 'created_by', as: 'user' });
User.hasMany(StockTake, { foreignKey: 'created_by', as: 'stockTakes' });

StockAdjustment.belongsTo(Variant, {foreignKey: 'variantId', as: 'variant'});
StockAdjustment.belongsTo(Store, {foreignKey: 'storeId', as: 'store'});
StockAdjustment.belongsTo(Warehouse, {foreignKey: 'warehouseId', as: 'warehouse'});
StockAdjustment.belongsTo(User, { as: 'createdByUser', foreignKey: 'createdBy' });
StockAdjustment.belongsTo(User, { as: 'approvedByUser', foreignKey: 'approvedBy' });
StockAdjustment.belongsTo(StockTake, { foreignKey: 'stockTakeId', as: 'stockTake' });
StockTake.hasMany(StockAdjustment, { foreignKey: 'stockTakeId', as: 'stockAdjustments' });

Coupon.belongsTo(User, { as: 'createdByUser', foreignKey: 'createdBy' });

Composition.belongsTo(Variant, { as: 'productVariant', foreignKey: 'productVariantId' });
Composition.belongsTo(Variant, { as: 'ingredientVariant', foreignKey: 'ingredientVariantId' });

Variant.hasMany(VariantImage, { foreignKey: 'variantId', as: 'images' });
VariantImage.belongsTo(Variant, { foreignKey: 'variantId' });

Product.hasMany(ProductTax, { foreignKey: 'ProductId', as: 'taxes' });
ProductTax.belongsTo(Product, { foreignKey: 'ProductId' });

Taxes.hasMany(ProductTax, { foreignKey: 'TaxId', as: 'taxes' });
ProductTax.belongsTo(Taxes, { foreignKey: 'TaxId' });

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
    PurchaseOrder,
    GoodsReceived,
    GoodsReceivedLineItem,
    Role,
    Permission,
    RolePermission,
    UserRole,
    Model,
    Warranty,
    Taxes,
    StockTake,
    StockAdjustment,
    Coupon,
    Composition,
    SalesOrder,
    Customer,
    SalesOrderLineItem,
    Payment,
    VariantImage,
    ProductTax
};
