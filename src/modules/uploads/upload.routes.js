const router  = require('express').Router();
const auth    = require('../../middlewares/auth');
const { single, uploadToCloudinary } = require('../../middlewares/upload');
const { success, error } = require('../../utils/response');

// Endpoint genérico para subir cualquier imagen
router.post('/', auth, single, uploadToCloudinary, (req, res) => {
  if (!req.fileUrl) return res.status(400).json(error('No se recibió ningún archivo', 400));
  res.json(success({ url: req.fileUrl }));
});

module.exports = router;