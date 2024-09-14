// migrations/YYYYMMDDHHMMSS-create-expenseStore.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('expenses', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      expense_category_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'expense_categories',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      reference_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      payment_method_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'payment_methods',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      paid_by_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users', // Assuming you have a User model
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      supplier_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'suppliers', // Assuming you have a Supplier model
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('expenses');
  },
};
