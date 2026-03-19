const router = require('express').Router();
const ctrl = require('./transactions.controller');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { createValidators, updateValidators } = require('./transactions.validators');
const { single, uploadToCloudinary } = require('../../middlewares/upload');

router.get('/',             auth, ctrl.getAll);
router.get('/summary',      auth, ctrl.getSummary);
router.get('/by-category',  auth, ctrl.getByCategory);
router.get('/:id',          auth, ctrl.getOne);
router.post('/',            auth, createValidators, validate, ctrl.create);
router.put('/:id',          auth, updateValidators, validate, ctrl.update);
router.delete('/:id',       auth, ctrl.remove);
router.post('/:id/photo',   auth, ctrl.uploadPhoto);

router.post('/:id/photo', auth, single, uploadToCloudinary, ctrl.uploadPhoto);
module.exports = router;