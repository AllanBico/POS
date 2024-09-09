module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('products', 'unit_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'units', // Assuming your brands table is named 'brands'
        key: 'id',
      },
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('products', 'unit_id');
  },
};