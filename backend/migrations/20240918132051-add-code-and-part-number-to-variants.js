'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('variants', 'code', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('variants', 'part_number', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('variants', 'code');
    await queryInterface.removeColumn('variants', 'part_number');
  }
};
