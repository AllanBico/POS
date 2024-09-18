module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('stock_takes', 'created_by', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('stock_takes', 'created_by');
  }
};