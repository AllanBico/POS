// migrations/xxxx-create-serial-number.js
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('serial_numbers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      serial_number: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      variant_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'variants',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      stock_movement_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'stock_movements',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM('available', 'sold', 'returned','inactive'),
        defaultValue: 'available',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('serial_numbers');
  },
};
