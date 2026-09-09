const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
  name: { type: DataTypes.STRING, allowNull: false },
  deadline: DataTypes.DATEONLY,
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'active' },
});

Project.associate = (models) => {
  Project.belongsToMany(models.Employee, {
    through: models.EmployeeProject,
    foreignKey: 'projectId',
    otherKey: 'employeeId',
  });
};

module.exports = Project;
