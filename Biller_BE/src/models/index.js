const sequelize = require('./db');
const User = require('./User');
const Product = require('./Product');
const Invoice = require('./Invoice');
const InvoiceProduct = require('./InvoiceProduct');

sequelize.sync()
  .then(async () => {
    const adminExists = await User.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        password: '12345', // You may want to hash this in production
        role: 'admin'
      });
      console.log('Default admin user created: username=admin, password=12345');
    }
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
