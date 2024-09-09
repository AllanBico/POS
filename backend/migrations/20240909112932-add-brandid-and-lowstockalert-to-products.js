module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('products', 'brandId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'brands', // Assuming your brands table is named 'brands'
        key: 'id',
      },
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('products', 'lowStockAlert', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('products', 'brandId');
    await queryInterface.removeColumn('products', 'lowStockAlert');
  },
};