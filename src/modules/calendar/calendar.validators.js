const { body } = require('express-validator');

const createValidators = [
  body('title')
    .notEmpty().withMessage('El título es requerido')
    .trim()
    .isLength({ max: 200 }).withMessage('El título no puede superar 200 caracteres'),
  body('eventDate')
    .notEmpty().withMessage('La fecha es requerida')
    .isISO8601().withMessage('La fecha no es válida'),
  body('eventType')
    .notEmpty().withMessage('El tipo es requerido')
    .isIn(['bill', 'income', 'reminder', 'suggestion'])
    .withMessage('Tipo inválido'),
  body('amount')
    .optional()
    .isFloat({ min: 0 }).withMessage('El monto debe ser mayor o igual a 0'),
  body('recurrent')
    .optional()
    .isBoolean().withMessage('recurrent debe ser true o false'),
];

const updateValidators = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('El título no puede superar 200 caracteres'),
  body('eventDate')
    .optional()
    .isISO8601().withMessage('La fecha no es válida'),
  body('eventType')
    .optional()
    .isIn(['bill', 'income', 'reminder', 'suggestion'])
    .withMessage('Tipo inválido'),
  body('status')
    .optional()
    .isIn(['pending', 'paid', 'overdue', 'suggestion'])
    .withMessage('Estado inválido'),
  body('amount')
    .optional()
    .isFloat({ min: 0 }).withMessage('El monto debe ser mayor o igual a 0'),
  body('recurrent')
    .optional()
    .isBoolean().withMessage('recurrent debe ser true o false'),
];

module.exports = { createValidators, updateValidators };