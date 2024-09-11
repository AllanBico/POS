'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('inventories', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      variantId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'variants', // Reference to the `Variant` table
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      warehouseId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'warehouses', // Reference to the `Warehouse` table
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      storeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'stores', // Reference to the `Store` table
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      minimumStock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      reorderPoint: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      costPrice: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('inventories');
  }
};
