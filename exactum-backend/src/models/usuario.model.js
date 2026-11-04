const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const generateId = require('../utils/generateId');

const Usuario = sequelize.define(
  'Usuario',
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
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    // Se guarda cifrada (bcrypt), nunca en texto plano
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: 'usuarios',
    timestamps: true,
    defaultScope: {
      attributes: { exclude: ['password'] }
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password'] }
      }
    }
  }
);

module.exports = Usuario;
