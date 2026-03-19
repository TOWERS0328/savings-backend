const router = require('express').Router();
const ctrl = require('./payment-methods.controller');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { createValidators, updateValidators } = require('./payment-methods.validators');

router.get('/',       auth, ctrl.getAll);
router.get('/:id',    auth, ctrl.getOne);
router.post('/',      auth, createValidators, validate, ctrl.create);
router.put('/:id',    auth, updateValidators, validate, ctrl.update);
router.delete('/:id', auth, ctrl.remove);

module.exports = router;