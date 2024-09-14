const {Permission, Model} = require('./models/associations');
const sequelize = require('./config/db');
async function insertModelsAndPermissions() {
    const modelNames = [
        'attribute',
        'attribute_value',
        'category',
        'customer',
        'expense',
        'expense_category',
        'good_receiving',
        'inventory',
        'payment_methods',
        'products',
        'purchase_order',
        'serial_number',
        'stock_movement',
        'stores',
        'subcategory',
        'supplier',
        'permissions',
        'roles',
        'roles_permissions',
        'user',
        'user_roles',
        'brand',
        'unit',
        'variant',
        'variant_attribute',
        'warehouse',
        'warranty'
    ];

    try {
        // Start a transaction
        const transaction = await sequelize.transaction();

        // Insert models
        for (const modelName of modelNames) {
            await Model.findOrCreate({
                where: { name: modelName },
                defaults: {
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                transaction
            });
        }

        // Insert CRUD permissions
        for (const modelName of modelNames) {
            const model = await Model.findOne({ where: { name: modelName }, transaction });
            if (model) {
                const modelId = model.id;

                await Promise.all([
                    Permission.findOrCreate({
                        where: { name: 'create', modelId },
                        defaults: { createdAt: new Date(), updatedAt: new Date() },
                        transaction
                    }),
                    Permission.findOrCreate({
                        where: { name: 'read', modelId },
                        defaults: { createdAt: new Date(), updatedAt: new Date() },
                        transaction
                    }),
                    Permission.findOrCreate({
                        where: { name: 'update', modelId },
                        defaults: { createdAt: new Date(), updatedAt: new Date() },
                        transaction
                    }),
                    Permission.findOrCreate({
                        where: { name: 'delete', modelId },
                        defaults: { createdAt: new Date(), updatedAt: new Date() },
                        transaction
                    })
                ]);
            }
        }

        // Commit transaction
        await transaction.commit();
        console.log('Models and permissions inserted successfully.');
    } catch (error) {
        console.error('Error inserting models and permissions:', error);
        // Rollback transaction in case of error
        await transaction.rollback();
    }
}

// Call the function
insertModelsAndPermissions();
