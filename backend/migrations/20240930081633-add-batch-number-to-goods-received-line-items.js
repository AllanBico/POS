'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('goods_received_line_items', 'batch_number', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Batch number for items without serial numbers',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('goods_received_line_items', 'batch_number');
  }
};
