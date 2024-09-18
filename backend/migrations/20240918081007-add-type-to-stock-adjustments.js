// migrations/[timestamp]-add-type-to-stock-adjustments.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('stock_adjustments', 'type', {
      type: Sequelize.ENUM('stock in', 'stock out'),
      allowNull: false,
      defaultValue: 'stock out',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('stock_adjustments', 'type');
    await queryInterface.sequelize.query('DROP TYPE "enum_stock_adjustments_type";'); // Drop enum type if no longer used
  }
};
