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
// accepts an options object so we can toggle cascade behavior at runtime
Department.associate = (models, opts = {}) => {
    const associationOptions = { foreignKey: 'departmentId' };
    // explicitly choose behavior so DB constraint is created as intended
    associationOptions.onDelete = opts.cascade ? 'CASCADE' : 'RESTRICT';
    Department.hasMany(models.Employee, associationOptions);
};
module.exports = Department;