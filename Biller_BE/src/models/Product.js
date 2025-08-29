const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  code: { type: DataTypes.STRING, unique: true, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  nameHindi: {
    type: DataTypes.STRING,
    // Ensure proper storage of Marathi/Hindi text
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  },
  unit: { type: DataTypes.STRING },
  price: { type: DataTypes.FLOAT, allowNull: false },
  stockQty: { type: DataTypes.INTEGER, defaultValue: 0 },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'products',
  timestamps: false
});

module.exports = Product;
