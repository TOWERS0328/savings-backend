const { body } = require('express-validator');

const createValidators = [
  body('categoryId')
    .notEmpty().withMessage('La categoría es requerida')
    .isUUID().withMessage('El categoryId no es válido'),
  body('amountLimit')
    .notEmpty().withMessage('El límite es requerido')
    .isFloat({ min: 0.01 }).withMessage('El límite debe ser mayor a 0'),
  body('period')
    .notEmpty().withMessage('El período es requerido')
    .isIn(['daily', 'weekly', 'biweekly', 'monthly', 'annual'])
    .withMessage('Período inválido'),
];

const updateValidators = [
  body('amountLimit')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('El límite debe ser mayor a 0'),
  body('period')
    .optional()
    .isIn(['daily', 'weekly', 'biweekly', 'monthly', 'annual'])
    .withMessage('Período inválido'),
];

module.exports = { createValidators, updateValidators };