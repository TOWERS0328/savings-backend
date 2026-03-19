const router = require('express').Router();
const ctrl = require('./calendar.controller');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { createValidators, updateValidators } = require('./calendar.validators');

router.get('/events',       auth, ctrl.getEvents);
router.get('/events/:id',   auth, ctrl.getOne);
router.post('/events',      auth, createValidators, validate, ctrl.create);
router.put('/events/:id',   auth, updateValidators, validate, ctrl.update);
router.delete('/events/:id',auth, ctrl.remove);

module.exports = router;