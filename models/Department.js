const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Department = sequelize.define('Department', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: DataTypes.STRING
});
// after Department is defined with sequelize.define( .)
Department.associate = (models) => {
    Department.hasMany(models.Employee, { foreignKey: 'departmentId' });
};
module.exports = Department;