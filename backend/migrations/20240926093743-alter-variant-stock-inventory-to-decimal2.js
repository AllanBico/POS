'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Change stockQuantity column to DECIMAL(10, 2)
    await queryInterface.changeColumn('inventories', 'minimum_stock', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert stockQuantity column back to INTEGER
    await queryInterface.changeColumn('inventories', 'minimum_stock', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  }
};
