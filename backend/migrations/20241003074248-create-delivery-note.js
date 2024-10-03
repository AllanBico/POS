'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('delivery_notes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      sales_order_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'sales_orders', // Table name for SalesOrder
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      delivery_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      status: {
        type: Sequelize.ENUM('pending', 'delivered', 'failed', 'returned'),
        defaultValue: 'pending',
      },
      delivery_address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      delivery_person: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users', // Table name for User
          key: 'id',
        },
        onDelete: 'SET NULL',
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
    await queryInterface.dropTable('delivery_notes');
  }
};