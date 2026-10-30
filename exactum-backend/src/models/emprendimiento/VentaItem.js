const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const generateId = require('../../utils/generateId');

// Cada producto que lleva una venta (el detalle de la venta)
const VentaItem = sequelize.define(
  'VentaItem',
  {
    id: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      defaultValue: generateId,
    },
    ventaId: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    productoId: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    // Nombre del producto al momento de la venta
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      get() {
        const raw = this.getDataValue('unitPrice');
        return raw === null || raw === undefined ? raw : Number(raw);
      },
    },
        // Costo del producto al momento de la venta (para calcular la utilidad)
    cost: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
      get() {
        const raw = this.getDataValue('cost');
        return raw === null || raw === undefined ? raw : Number(raw);
      },
    },
    
    // Orden dentro de la venta
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  { tableName: 'venta_items', timestamps: true }
);

module.exports = VentaItem;
