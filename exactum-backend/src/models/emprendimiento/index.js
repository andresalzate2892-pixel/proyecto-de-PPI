// Reúne los modelos de ventas y gastos y define cómo se relacionan.
// constraints: false -> no se crean llaves foráneas en SQL Server; la
// integridad (por ejemplo, borrar los pagos de una venta) la maneja el
// servicio dentro de una transacción. Así se evitan los errores de
// "múltiples rutas de cascada" de SQL Server.

const Venta = require('./Venta');
const VentaItem = require('./VentaItem');
const Gasto = require('./Gasto');
const Pago = require('./Pago');

Venta.hasMany(VentaItem, {
  as: 'items',
  foreignKey: 'ventaId',
  constraints: false,
});

Venta.hasMany(Pago, {
  as: 'payments',
  foreignKey: 'ventaId',
  constraints: false,
});

Gasto.hasMany(Pago, {
  as: 'payments',
  foreignKey: 'gastoId',
  constraints: false,
});

module.exports = { Venta, VentaItem, Gasto, Pago };
