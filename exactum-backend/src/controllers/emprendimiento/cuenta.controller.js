// Ventas y gastos se manejan igual (listar, crear, eliminar y abonar), así
// que comparten este controlador. Recibe el servicio que le corresponde.
function createCuentaController(service) {
  return {
    async getAll(req, res, next) {
      try {
        res.json(await service.getAll(req.query.negocioId));
      } catch (error) {
        next(error);
      }
    },

    async getById(req, res, next) {
      try {
        res.json(await service.getById(req.params.id));
      } catch (error) {
        next(error);
      }
    },

    async create(req, res, next) {
      try {
        res.status(201).json(await service.create(req.body));
      } catch (error) {
        next(error);
      }
    },

    async remove(req, res, next) {
      try {
        await service.remove(req.params.id);
        res.json({});
      } catch (error) {
        next(error);
      }
    },

    // Registra un abono y devuelve la venta o el gasto actualizado
    async addPago(req, res, next) {
      try {
        res.status(201).json(await service.addPago(req.params.id, req.body));
      } catch (error) {
        next(error);
      }
    },

    // Quita un abono y devuelve la venta o el gasto actualizado
    async removePago(req, res, next) {
      try {
        res.json(await service.removePago(req.params.id, req.params.pagoId));
      } catch (error) {
        next(error);
      }
    },
  };
}

module.exports = createCuentaController;
