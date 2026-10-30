const { Router } = require('express');
const createCuentaController = require('../../controllers/emprendimiento/cuenta.controller');
const gastoService = require('../../services/emprendimiento/gasto.service');

const controller = createCuentaController(gastoService);

const router = Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.delete('/:id', controller.remove);

// Abonos de un gasto a crédito
router.post('/:id/pagos', controller.addPago);
router.delete('/:id/pagos/:pagoId', controller.removePago);

module.exports = router;
