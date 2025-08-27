const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mariadb',
  logging: false,
});

module.exports = sequelize;


const User = require('./User');
const Product = require('./Product');
const Invoice = require('./Invoice');
const InvoiceProduct = require('./InvoiceProduct');

sequelize.sync()
  .then(() => {
    console.log('Created table: users');
    console.log('Created table: products');
    console.log('Created table: invoices');
    console.log('Created table: invoice_products');
    console.log('Database & tables created!');
  })
  .catch((err) => {
    console.error('Sequelize sync error:', err);
  });

// Test connection and log errors
sequelize.authenticate()
  .then(() => {
    console.log('Sequelize connection established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });
