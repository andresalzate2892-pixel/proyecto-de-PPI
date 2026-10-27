const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const generateId = require('../utils/generateId');

const Movimiento = sequelize.define(
  'Movimiento',
  {
    id: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      defaultValue: generateId,
    },
    type: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: { isIn: [['Ingreso', 'Gasto']] },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    // DECIMAL llega como texto desde SQL Server; el getter lo devuelve como número
    value: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      get() {
        const raw = this.getDataValue('value');
        return raw === null || raw === undefined ? raw : Number(raw);
      },
    },
    category: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    space: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: { isIn: [['Personal', 'Emprendimiento']] },
    },
    userId: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
  },
  { tableName: 'movimientos', timestamps: true }
);

module.exports = Movimiento;
