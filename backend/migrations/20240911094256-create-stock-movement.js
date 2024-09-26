'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('stock_movements', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      variant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'variants',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      transaction_type: {
        type: Sequelize.ENUM('stock_in', 'return_from_client', 'return_to_supplier', 'adjustment', 'transfer','opening_balance'),
        allowNull: false,
      },
      source_type: {
        type: Sequelize.ENUM('warehouse', 'client', 'supplier','store'),
        allowNull: false,
      },
      source_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      destination_type: {
        type: Sequelize.ENUM('warehouse', 'client', 'supplier','store'),
        allowNull: false,
      },
      destination_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      transaction_date: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('stock_movements');
  },
};