const { Router } = require('express');
const controller = require('../../controllers/emprendimiento/producto.controller');

const router = Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.patch('/:id', controller.update);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
