const { DataTypes } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('Projects', 'status', { type: DataTypes.STRING, allowNull: false, defaultValue: 'active' });
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('Projects', 'status');
  }
};
