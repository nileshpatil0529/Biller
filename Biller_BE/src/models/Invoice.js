const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Invoice = sequelize.define('Invoice', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  client: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING },
  discount: { type: DataTypes.FLOAT, defaultValue: 0 },
  total: { type: DataTypes.FLOAT, allowNull: false },
  grandTotal: { type: DataTypes.FLOAT, allowNull: false },
  paymentStatus: { type: DataTypes.STRING },
  paymentMode: { type: DataTypes.STRING },
  invoiceNumber: { type: DataTypes.STRING },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'invoices',
  timestamps: false
});

module.exports = Invoice;
