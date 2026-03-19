const { body } = require('express-validator');

const createValidators = [
  body('name')
    .notEmpty().withMessage('El nombre es requerido')
    .trim()
    .isLength({ max: 100 }).withMessage('El nombre no puede superar 100 caracteres'),
  body('type')
    .notEmpty().withMessage('El tipo es requerido')
    .isIn(['cash', 'debit', 'credit', 'transfer', 'other'])
    .withMessage('Tipo inválido'),
];

const updateValidators = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('El nombre no puede superar 100 caracteres'),
  body('type')
    .optional()
    .isIn(['cash', 'debit', 'credit', 'transfer', 'other'])
    .withMessage('Tipo inválido'),
];

module.exports = { createValidators, updateValidators };