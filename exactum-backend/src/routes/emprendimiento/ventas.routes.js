const { Router } = require('express');
const createCuentaController = require('../../controllers/emprendimiento/cuenta.controller');
const ventaService = require('../../services/emprendimiento/venta.service');

const controller = createCuentaController(ventaService);

const router = Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.delete('/:id', controller.remove);

// Abonos de una venta a crédito
router.post('/:id/pagos', controller.addPago);
router.delete('/:id/pagos/:pagoId', controller.removePago);

module.exports = router;
