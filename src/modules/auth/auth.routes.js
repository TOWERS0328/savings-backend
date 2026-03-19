const router = require('express').Router();
const controller = require('./auth.controller');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { registerValidators, loginValidators } = require('./validators');
const { single, uploadToCloudinary } = require('../../middlewares/upload'); // ← agregar

router.post('/register',      registerValidators, validate, controller.register);
router.post('/login',         loginValidators,    validate, controller.login);
router.get('/me',             auth, controller.me);
router.put('/profile',        auth, controller.updateProfile);
router.put('/password',       auth, controller.changePassword);
router.post('/upload-photo',  auth, single, uploadToCloudinary, controller.uploadPhoto); // ← ctrl → controller

module.exports = router;