const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');

module.exports = (req, res, next) => {
  const header = req.headers['authorization'];

  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json(error('Token requerido', 401));

  try {
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub };
    next();
  } catch {
    return res.status(401).json(error('Token inválido o expirado', 401));
  }
};