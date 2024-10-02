'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('sales_orders', 'discount_type', {
      type: Sequelize.ENUM('fixed', 'percentage'),
      allowNull: false,
      defaultValue: 'fixed',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('sales_orders', 'discount_type');
  }
};
