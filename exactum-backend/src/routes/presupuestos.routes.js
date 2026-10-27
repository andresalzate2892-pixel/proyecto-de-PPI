const { Router } = require('express');
const controller = require('../controllers/presupuestos.controller');
const v = require('../middlewares/validators');

const router = Router();

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', v.validateCreatePresupuesto, controller.create);
router.put('/:id', v.validatePutPresupuesto, controller.update);
router.patch('/:id', v.validatePatchPresupuesto, controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
