const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Employee = sequelize.define('Employee', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        unique: true
    },
    departmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Departments',
            key: 'id'
        }
    }
});

    

// const Department = require('./Department');
// Employee.belongsTo(Department, { foreignKey: 'departmentId', onDelete: 'CASCADE' });
// after Employee is defined with sequelize.define( .)
Employee.associate = (models) => {
    Employee.belongsTo(models.Department, { foreignKey: 'departmentId' });
    // many-to-many to Project through EmployeeProject
    Employee.belongsToMany(models.Project, {
        through: models.EmployeeProject,
        foreignKey: 'employeeId',
        otherKey: 'projectId',
    });
};

module.exports = Employee;