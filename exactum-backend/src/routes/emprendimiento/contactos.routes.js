const { Router } = require('express');
const createContactoController = require('../../controllers/emprendimiento/contacto.controller');

// Fábrica: devuelve las rutas para "clientes" o para "proveedores"
function createContactosRouter(type) {
  const controller = createContactoController(type);
  const router = Router();

  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);
  router.post('/', controller.create);
  router.patch('/:id', controller.update);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.remove);

  return router;
}

module.exports = createContactosRouter;
