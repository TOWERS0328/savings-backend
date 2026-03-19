const { body, query } = require('express-validator');

const createValidators = [
  body('type')
    .notEmpty().withMessage('El tipo es requerido')
    .isIn(['income', 'expense']).withMessage('El tipo debe ser income o expense'),

  body('amount')
    .notEmpty().withMessage('El monto es requerido')
    .isFloat({ min: 0.01 }).withMessage('El monto debe ser mayor a 0'),

  body('establishment')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('El establecimiento no puede superar 200 caracteres'),

  body('categoryId')
    .optional()
    .isUUID().withMessage('El categoryId no es válido'),

  body('paymentMethodId')
    .optional()
    .isUUID().withMessage('El paymentMethodId no es válido'),

  body('description')
    .optional()
    .trim(),

  body('date')
    .optional()
    .isISO8601().withMessage('La fecha no es válida'),
];

const updateValidators = [
  body('amount')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('El monto debe ser mayor a 0'),

  body('type')
    .optional()
    .isIn(['income', 'expense']).withMessage('El tipo debe ser income o expense'),

  body('establishment')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('El establecimiento no puede superar 200 caracteres'),

  body('categoryId')
    .optional()
    .isUUID().withMessage('El categoryId no es válido'),

  body('paymentMethodId')
    .optional()
    .isUUID().withMessage('El paymentMethodId no es válido'),

  body('date')
    .optional()
    .isISO8601().withMessage('La fecha no es válida'),
];

module.exports = { createValidators, updateValidators };