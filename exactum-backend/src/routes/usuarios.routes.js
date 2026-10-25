const { Router } = require('express');
const controller = require('../controllers/usuarios.controller');
const v = require('../middlewares/validators');

const router = Router();

router.post('/login', v.validateLogin, controller.login); // antes de "/:id"
router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', v.validateCreateUsuario, controller.create);
router.put('/:id', v.validatePutUsuario, controller.update);
router.patch('/:id', v.validatePatchUsuario, controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
