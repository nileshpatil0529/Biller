const sequelize = require('./db');
const User = require('./User');
const Product = require('./Product');
const Invoice = require('./Invoice');
const InvoiceProduct = require('./InvoiceProduct');

sequelize.sync()
  .then(async () => {
    const adminExists = await User.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('12345', 10);
      await User.create({
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Default admin user created: username=admin, password=12345 (hashed)');
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
