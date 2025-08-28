
const sequelize = require('./db');



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
