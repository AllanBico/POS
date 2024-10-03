'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('delivery_line_items', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      delivery_note_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'delivery_notes', // Table name for DeliveryNote
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      sales_order_line_item_id: {
        type: Sequelize.INTEGER,
        allowNull: true, // Allow null for deliveries not linked to sales orders
        references: {
          model: 'sales_order_line_items', // Table name for SalesOrderLineItem
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      variant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'variants', // Table name for Variant
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('delivery_line_items');
  }
};