const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmployeeProject = sequelize.define('EmployeeProject', {
  role: { type: DataTypes.STRING, allowNull: false },
  hoursAllocated: DataTypes.INTEGER,
});

module.exports = EmployeeProject;
