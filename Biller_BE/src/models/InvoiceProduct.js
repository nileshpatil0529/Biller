const { DataTypes } = require('sequelize');
const sequelize = require('./db');
const Invoice = require('./Invoice');
const Product = require('./Product');


const InvoiceProduct = sequelize.define('InvoiceProduct', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  invoice_id: { type: DataTypes.INTEGER, allowNull: false },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  sell_qty: { type: DataTypes.INTEGER, defaultValue: 0 },
  price: { type: DataTypes.FLOAT },
  totalValue: { type: DataTypes.FLOAT }
}, {
  tableName: 'invoice_products',
  timestamps: false
});

// Associations
InvoiceProduct.belongsTo(Invoice, { foreignKey: 'invoice_id' });
Invoice.hasMany(InvoiceProduct, { foreignKey: 'invoice_id' });
InvoiceProduct.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(InvoiceProduct, { foreignKey: 'product_id' });

module.exports = InvoiceProduct;
