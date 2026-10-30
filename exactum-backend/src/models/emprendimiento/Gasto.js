const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const generateId = require('../../utils/generateId');

const Gasto = sequelize.define(
  'Gasto',
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
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    total: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      get() {
        const raw = this.getDataValue('total');
        return raw === null || raw === undefined ? raw : Number(raw);
      },
    },
    // Proveedor (opcional si el gasto es de contado)
    proveedorId: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    proveedorName: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    paymentType: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: { isIn: [['Contado', 'Crédito']] },
    },
    // Fecha límite de pago (solo gastos a crédito)
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  { tableName: 'gastos', timestamps: true }
);

module.exports = Gasto;
