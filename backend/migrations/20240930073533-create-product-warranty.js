'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('product_warranties', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      goods_received_line_item_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'goods_received_line_items',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      warranty_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'warranties', // This should be your warranty type table
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      warranty_start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      warranty_end_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('product_warranties');
  }
};