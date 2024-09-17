module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('stock_movements', 'destination_type', {
      type: Sequelize.ENUM('warehouse', 'client', 'supplier', 'store'),
      allowNull: true,
    });
    await queryInterface.changeColumn('stock_movements', 'source_type', {
      type: Sequelize.ENUM('warehouse', 'client', 'supplier', 'store'),
      allowNull: true,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('stock_movements', 'destination_type', {
      type: Sequelize.ENUM('warehouse', 'client', 'supplier'),
      allowNull: true,
    });
    await queryInterface.changeColumn('stock_movements', 'source_type', {
      type: Sequelize.ENUM('warehouse', 'client', 'supplier'),
      allowNull: true,
    });
  },
};
