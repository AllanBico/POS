'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('suppliers', 'postal_code', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('suppliers', 'tax_identification_number', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('suppliers', 'postal_code');
    await queryInterface.removeColumn('suppliers', 'tax_identification_number');
  }
};
