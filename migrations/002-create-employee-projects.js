const { DataTypes } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('EmployeeProjects', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      employeeId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Employees', key: 'id' }, onDelete: 'CASCADE' },
      projectId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Projects', key: 'id' }, onDelete: 'CASCADE' },
      role: { type: DataTypes.STRING, allowNull: false },
      hoursAllocated: { type: DataTypes.INTEGER },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addConstraint('EmployeeProjects', {
      type: 'unique',
      fields: ['employeeId', 'projectId'],
      name: 'EmployeeProjects_employeeId_projectId_unique'
    });
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('EmployeeProjects');
  }
};
