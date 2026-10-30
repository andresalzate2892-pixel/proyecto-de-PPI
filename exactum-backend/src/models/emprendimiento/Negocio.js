const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const generateId = require('../../utils/generateId');

// Un negocio por usuario (userId es único)
const Negocio = sequelize.define(
  'Negocio',
  {
    id: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      defaultValue: generateId,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
      validate: { notEmpty: { msg: 'El nombre del negocio es obligatorio' } },
    },
    activity: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { notEmpty: { msg: 'El tipo de actividad es obligatorio' } },
    },
    nit: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
      validate: { isEmail: { msg: 'El correo del negocio no es válido' } },
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    userId: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
  },
  { tableName: 'negocios', timestamps: true }
);

module.exports = Negocio;
