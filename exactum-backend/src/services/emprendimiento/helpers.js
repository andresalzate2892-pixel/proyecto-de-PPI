const Negocio = require('../../models/emprendimiento/Negocio');
const AppError = require('../../utils/AppError');

// Verifica que se indicó un negocio y que existe
async function assertNegocio(negocioId) {
  if (!negocioId) {
    throw new AppError('El campo "negocioId" es obligatorio', 400);
  }

  const negocio = await Negocio.findByPk(negocioId);

  if (!negocio) {
    throw new AppError('El negocio indicado en "negocioId" no existe', 400);
  }

  return negocio;
}

module.exports = { assertNegocio };
