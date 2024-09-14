// migrations/XXXXXX-add-model-id-to-permissions.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('permissions', 'model_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'models', // Name of the table in your database
        key: 'id'
      },
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('permissions', 'model_id');
  }
};
