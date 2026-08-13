const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Book = sequelize.define('Book', {
title: {
type: DataTypes.STRING,
allowNull: false
},
author: DataTypes.STRING,
isbn: DataTypes.STRING,
publishedYear: DataTypes.INTEGER,
inStock: {
type: DataTypes.BOOLEAN,
defaultValue: true
}
});
module.exports = Book;