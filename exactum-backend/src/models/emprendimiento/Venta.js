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

const Venta = sequelize.define(
  'Venta',
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    // Cliente (opcional si la venta es de contado)
    clienteId: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    clienteName: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    paymentType: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: { isIn: [['Contado', 'Crédito']] },
    },
    // Fecha límite de pago (solo ventas a crédito)
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    total: decimalField('total'),
  },
  { tableName: 'ventas', timestamps: true }
);

module.exports = Venta;
