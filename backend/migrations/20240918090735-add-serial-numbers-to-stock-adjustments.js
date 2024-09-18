'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('stock_adjustments', 'serial_numbers', {
      type: Sequelize.STRING,
      allowNull: true, // Or false, depending on your requirement
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('stock_adjustments', 'serial_numbers');
  }
};
