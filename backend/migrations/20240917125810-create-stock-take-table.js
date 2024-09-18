module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('stock_takes', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      variant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'variants',
          key: 'id',
        },
      },
      store_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'stores',
          key: 'id',
        },
      },
      warehouse_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'warehouses',
          key: 'id',
        },
      },
      system_quantity: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      physical_quantity: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      difference: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'pending',
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('stock_takes');
  },
};
