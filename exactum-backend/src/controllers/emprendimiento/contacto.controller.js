const contactoService = require('../../services/emprendimiento/contacto.service');

// Fábrica: crea el controlador para "clientes" o para "proveedores".
// Así el mismo código atiende las dos rutas.
function createContactoController(type) {
  return {
    async getAll(req, res, next) {
      try {
        const contactos = await contactoService.getAll(type, req.query.negocioId);
        res.json(contactos);
      } catch (error) {
        next(error);
      }
    },

    async getById(req, res, next) {
      try {
        const contacto = await contactoService.getById(type, req.params.id);
        res.json(contacto);
      } catch (error) {
        next(error);
      }
    },

    async create(req, res, next) {
      try {
        const contacto = await contactoService.create(type, req.body);
        res.status(201).json(contacto);
      } catch (error) {
        next(error);
      }
    },

    async update(req, res, next) {
      try {
        const contacto = await contactoService.update(type, req.params.id, req.body);
        res.json(contacto);
      } catch (error) {
        next(error);
      }
    },

    async remove(req, res, next) {
      try {
        await contactoService.remove(type, req.params.id);
        res.json({});
      } catch (error) {
        next(error);
      }
    },
  };
}

module.exports = createContactoController;
