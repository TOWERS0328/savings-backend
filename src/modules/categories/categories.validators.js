const { body } = require('express-validator');

const createValidators = [
  body('name')
    .notEmpty().withMessage('El nombre es requerido')
    .trim()
    .isLength({ max: 100 }).withMessage('El nombre no puede superar 100 caracteres'),
  body('icon')
    .notEmpty().withMessage('El ícono es requerido')
    .trim(),
  body('color')
    .notEmpty().withMessage('El color es requerido')
    .matches(/^#([0-9A-Fa-f]{6})$/).withMessage('El color debe ser un hex válido (#RRGGBB)'),
  body('type')
    .notEmpty().withMessage('El tipo es requerido')
    .isIn(['income', 'expense']).withMessage('El tipo debe ser income o expense'),
];

const updateValidators = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('El nombre no puede superar 100 caracteres'),
  body('icon')
    .optional()
    .trim(),
  body('color')
    .optional()
    .matches(/^#([0-9A-Fa-f]{6})$/).withMessage('El color debe ser un hex válido (#RRGGBB)'),
];

module.exports = { createValidators, updateValidators };