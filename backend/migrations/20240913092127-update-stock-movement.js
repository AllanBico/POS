'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('stock_movements', 'source_warehouse_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'warehouses', // Assuming your Warehouse table is called 'Warehouses'
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('stock_movements', 'destination_warehouse_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'warehouses', // Assuming your Warehouse table is called 'Warehouses'
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('stock_movements', 'source_store_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'stores', // Assuming your Store table is called 'Stores'
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('stock_movements', 'destination_store_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'stores', // Assuming your Store table is called 'Stores'
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('stock_movements', 'source_warehouse_id');
    await queryInterface.removeColumn('stock_movements', 'destination_warehouse_id');
    await queryInterface.removeColumn('stock_movements', 'source_store_id');
    await queryInterface.removeColumn('stock_movements', 'destination_store_id');
  }
};