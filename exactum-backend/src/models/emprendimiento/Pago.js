const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const generateId = require('../../utils/generateId');

// Pagos y abonos. Pertenecen a una venta (ventaId) o a un gasto (gastoId).
// Una venta de contado se guarda con un pago por el total; una venta a
// crédito empieza sin pagos y se va pagando con abonos.
const Pago = sequelize.define(
  'Pago',
  {
    id: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      defaultValue: generateId,
    },
    ventaId: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    gastoId: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      get() {
        const raw = this.getDataValue('amount');
        return raw === null || raw === undefined ? raw : Number(raw);
      },
    },
  },
  { tableName: 'pagos', timestamps: true }
);

module.exports = Pago;
