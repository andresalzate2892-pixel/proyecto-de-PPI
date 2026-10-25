const { Router } = require('express');
const controller = require('../controllers/movimientos.controller');
const v = require('../middlewares/validators');

const router = Router();

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', v.validateCreateMovimiento, controller.create);
router.put('/:id', v.validatePutMovimiento, controller.update);
router.patch('/:id', v.validatePatchMovimiento, controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
