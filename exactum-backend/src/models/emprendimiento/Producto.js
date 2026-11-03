const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const generateId = require('../../utils/generateId');

// DECIMAL llega como texto desde SQL Server; el getter lo devuelve como número
function decimalField(name) {
  return {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    defaultValue: 0,
    get() {
      const raw = this.getDataValue(name);
      return raw === null || raw === undefined ? raw : Number(raw);
    },
  };
}

const Producto = sequelize.define(
  'Producto',
  {
    id: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      defaultValue: generateId,
    },
    negocioId: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    price: decimalField('price'),
    cost: decimalField('cost'),
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    minStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },
  },
  { tableName: 'productos', timestamps: true }
);

module.exports = Producto;
