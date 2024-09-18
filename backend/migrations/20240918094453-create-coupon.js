'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('coupons', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      discount_type: {
        type: Sequelize.ENUM('percentage', 'fixed_amount', 'buy_x_get_y'),
        allowNull: false,
      },
      discount_value: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      minimum_purchase_amount: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      expiry_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      usage_limit: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      customer_limit: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      applicable_to: {
        type: Sequelize.ENUM('product', 'variant', 'category', 'subcategory'),
        allowNull: true,
      },
      applicable_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      customer_restrictions: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('active', 'expired', 'disabled'),
        defaultValue: 'active',
      },
      usage_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('coupons');
  },
};