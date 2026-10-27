const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const generateId = require('../utils/generateId');

const Presupuesto = sequelize.define(
  'Presupuesto',
  {
    id: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      defaultValue: generateId,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    // "limit" es palabra reservada en SQL, por eso la columna se llama "limite"
    limit: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      field: 'limite',
      get() {
        const raw = this.getDataValue('limit');
        return raw === null || raw === undefined ? raw : Number(raw);
      },
    },
    category: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
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
  { tableName: 'presupuestos', timestamps: true }
);

module.exports = Presupuesto;
