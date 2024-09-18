// migrations/YYYYMMDDHHmmss-add-stockTakeId-to-stockAdjustment.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('stock_adjustments', 'stock_take_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'stock_takes', // The name of the StockTake table
        key: 'id',
      },
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('stock_adjustments', 'stock_take_id');
  },
};
