const { error } = require('../utils/response');

module.exports = (err, req, res, next) => {
  console.error('[ERROR]', err.message);

  if (err.code === 'P2002')
    return res.status(409).json(error('Ya existe un registro con ese valor', 409));

  if (err.code === 'P2025')
    return res.status(404).json(error('Registro no encontrado', 404));

  res.status(500).json(error('Error interno del servidor', 500));
};