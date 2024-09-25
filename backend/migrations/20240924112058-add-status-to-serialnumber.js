'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('serial_numbers', 'status', {
      type: Sequelize.ENUM('available', 'reserved', 'sold', 'returned','inactive'),
      allowNull: false,
      defaultValue: 'available',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('serial_numbers', 'status');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_serial_numbers_status";'); // Drops ENUM type
  }
};
