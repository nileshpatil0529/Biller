console.log('InvoiceProduct model loaded');
const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const InvoiceProduct = sequelize.define('InvoiceProduct', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  invoice_id: { type: DataTypes.INTEGER, allowNull: false },
  product_id: { type: DataTypes.STRING, allowNull: false },
  sell_qty: { type: DataTypes.INTEGER, defaultValue: 0 },
  price: { type: DataTypes.FLOAT },
  totalValue: { type: DataTypes.FLOAT }
}, {
  tableName: 'invoice_products',
  timestamps: false
});

module.exports = InvoiceProduct;
