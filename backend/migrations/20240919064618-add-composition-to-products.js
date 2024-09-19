'use strict';

const {DataTypes} = require("sequelize");
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('products', 'is_composition', {
      type: Sequelize.BOOLEAN,
      defaultValue: false, // False for regular products, true for recipes
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('products', 'is_composition');
  }
};
