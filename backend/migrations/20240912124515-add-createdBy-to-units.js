'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('units', 'created_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users', // Name of your users table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('units', 'created_by');
  }
};
