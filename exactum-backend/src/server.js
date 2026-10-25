require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a SQL Server establecida');

    // Crea las tablas si no existen (usuarios, movimientos, presupuestos)
    await sequelize.sync();
    console.log('Tablas sincronizadas');

    app.listen(PORT, () => {
      console.log(`API de Exactum escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error.message);
    process.exit(1);
  }
}

start();
