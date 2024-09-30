'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('product_warranties', 'warranty_start_date', {
      type: Sequelize.DATE,
      allowNull: true, // Allow null values
    });

    await queryInterface.changeColumn('product_warranties', 'warranty_end_date', {
      type: Sequelize.DATE,
      allowNull: true, // Allow null values
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('product_warranties', 'warranty_start_date', {
      type: Sequelize.DATE,
      allowNull: false, // Revert to not allowing null
    });

    await queryInterface.changeColumn('product_warranties', 'warranty_end_date', {
      type: Sequelize.DATE,
      allowNull: false, // Revert to not allowing null
    });
  }
};