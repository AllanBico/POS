'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('variant_images', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      image_url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      variant_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'variants', // Make sure this matches the actual table name for the 'Variant' model
          key: 'id',
        },
        onDelete: 'CASCADE',  // If a variant is deleted, its images will also be deleted
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('variant_images');
  }
};
