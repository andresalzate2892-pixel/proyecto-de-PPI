const sequelize = require('../config/db');
const Usuario = require('./usuario.model');
const Movimiento = require('./movimiento.model');
const Presupuesto = require('./presupuesto.model');

// Un usuario tiene muchos movimientos y muchos presupuestos.
// Si se elimina el usuario, se eliminan también sus datos.
Usuario.hasMany(Movimiento, { foreignKey: 'userId', onDelete: 'CASCADE' });
Movimiento.belongsTo(Usuario, { foreignKey: 'userId' });

Usuario.hasMany(Presupuesto, { foreignKey: 'userId', onDelete: 'CASCADE' });
Presupuesto.belongsTo(Usuario, { foreignKey: 'userId' });

module.exports = { sequelize, Usuario, Movimiento, Presupuesto };
