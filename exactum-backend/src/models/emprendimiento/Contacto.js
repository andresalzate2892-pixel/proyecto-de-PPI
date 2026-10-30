const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const generateId = require('../../utils/generateId');

// Clientes y proveedores tienen los mismos datos: se guardan en una sola
// tabla y el campo "type" indica de cuál se trata.
const Contacto = sequelize.define(
  'Contacto',
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
    type: {
      type: DataTypes.STRING(15),
      allowNull: false,
      validate: { isIn: [['clientes', 'proveedores']] },
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    document: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    notes: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  { tableName: 'contactos', timestamps: true }
);

module.exports = Contacto;
