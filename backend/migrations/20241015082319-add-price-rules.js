'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('price_rules', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      variant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'variants', // Make sure this matches your actual variants table name
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      rule_type: {
        type: Sequelize.ENUM('time', 'bundle', 'location', 'quantity', 'customer'),
        allowNull: false,
      },
      adjustment_type: {
        type: Sequelize.ENUM('percentage', 'fixed'),
        allowNull: false,
      },
      adjustment_value: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      // For time-based rules
      start_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      daily_start_time: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      daily_end_time: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      // For bundle-based rules
      bundle_with_variant_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'variants', // Make sure this matches your actual variants table name
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      // For location-based rules
      location_type: {
        type: Sequelize.ENUM('store', 'warehouse'),
        allowNull: true,
      },
      location_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      // For quantity-based rules
      min_quantity: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      // For customer-based rules
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'customers', // Make sure this matches your actual customers table name
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('price_rules');
  }
};
