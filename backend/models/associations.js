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
const SerialNumber = require("./serialNumber");
const VariantAttributeValue = require("./variantAttributeValue");
const ExpenseCategory = require('./ExpenseCategory');
const Expense = require('./Expense');
const PaymentMethod = require('./PaymentMethod');
const Supplier = require('./Supplier'); // Assuming you have a Supplier model
const User = require('./User'); // Assuming you have a User model

// Define associations AFTER model initialization
Product.hasMany(Variant, { foreignKey: 'productId', as: 'variants' });
Variant.belongsTo(Product, { foreignKey: 'productId', as: 'Product' });

Product.belongsTo(Category, { as: 'category', foreignKey: 'categoryId' });
Product.belongsTo(Subcategory, { as: 'subcategory', foreignKey: 'subcategoryId' });
Product.belongsTo(Brand, { as: 'brand', foreignKey: 'brandId' });
Product.belongsTo(Unit, { as: 'Unit', foreignKey: 'unitId' });

Attribute.hasMany(AttributeValue, { foreignKey: 'attributeId' });
AttributeValue.belongsTo(Attribute, { foreignKey: 'attributeId' });

Inventory.belongsTo(Variant, { foreignKey: 'variantId', as: 'InventoryVariants' });
Inventory.belongsTo(Warehouse, { foreignKey: 'warehouseId' });
Inventory.belongsTo(Store, { foreignKey: 'storeId' });

SerialNumber.belongsTo(Product, { foreignKey: 'productId' });

Category.hasMany(Subcategory, { foreignKey: 'categoryId', onDelete: 'CASCADE' });
Subcategory.belongsTo(Category, { foreignKey: 'categoryId' });

Variant.hasMany(VariantAttributeValue, { foreignKey: 'variantId', as: 'variantAttributeValues' });
VariantAttributeValue.belongsTo(Variant, { foreignKey: 'variantId' });

AttributeValue.hasMany(VariantAttributeValue, { foreignKey: 'attributeValueId', as: 'attributeValueVariants' });
VariantAttributeValue.belongsTo(AttributeValue, { foreignKey: 'attributeValueId' });

Expense.belongsTo(ExpenseCategory, { foreignKey: 'expenseCategoryId' });
Expense.belongsTo(PaymentMethod, { foreignKey: 'paymentMethodId' });
Expense.belongsTo(User, { foreignKey: 'paidById' });
Expense.belongsTo(Supplier, { foreignKey: 'supplierId' });

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
    SerialNumber,
    VariantAttributeValue,
    Warehouse,
    Store,
    ExpenseCategory,
    Expense,
    PaymentMethod,
    Supplier,
    User
};
