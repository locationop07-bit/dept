require('dotenv').config();
const { Sequelize } = require('sequelize');
const useSsl = process.env.DB_SSL === 'true';
const sequelize = new Sequelize(
	process.env.DB_NAME,
	process.env.DB_USER,
	process.env.DB_PASSWORD,
	{
		host: process.env.DB_HOST,
		port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
		dialect: 'postgres',
		dialectOptions: useSsl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
		logging: false
	}
);	

module.exports = sequelize;