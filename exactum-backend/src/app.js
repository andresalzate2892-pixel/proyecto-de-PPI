const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const usuariosRoutes = require('./routes/usuarios.routes');
const movimientosRoutes = require('./routes/movimientos.routes');
const presupuestosRoutes = require('./routes/presupuestos.routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const negociosRoutes = require('./routes/emprendimiento/negocios.routes');
const productosRoutes = require('./routes/emprendimiento/productos.routes');
const createContactosRouter = require('./routes/emprendimiento/contactos.routes');
const ventasRoutes = require('./routes/emprendimiento/ventas.routes');
const gastosRoutes = require('./routes/emprendimiento/gastos.routes');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Verificación rápida de que la API está arriba
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API de Exactum funcionando' });
});

// Rutas (mismas URLs que usaba json-server)
app.use('/usuarios', usuariosRoutes);
app.use('/movimientos', movimientosRoutes);
app.use('/presupuestos', presupuestosRoutes);
app.use('/negocios', negociosRoutes);
app.use('/productos', productosRoutes);
app.use('/clientes', createContactosRouter('clientes'));
app.use('/proveedores', createContactosRouter('proveedores'));
app.use('/ventas', ventasRoutes);
app.use('/gastos', gastosRoutes);

// Manejo de errores (siempre al final)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
