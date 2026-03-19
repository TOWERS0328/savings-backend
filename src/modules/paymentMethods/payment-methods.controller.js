const service = require('./payment-methods.service');
const { success, error } = require('../../utils/response');

async function getAll(req, res, next) {
  try {
    const result = await service.getAll(req.user.id);
    res.json(success(result));
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const result = await service.getById(req.user.id, req.params.id);
    res.json(success(result));
  } catch (err) {
    if (err.status === 404) return res.status(404).json(error(err.message, 404));
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const result = await service.create(req.user.id, req.body);
    res.status(201).json(success(result));
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const result = await service.update(req.user.id, req.params.id, req.body);
    res.json(success(result));
  } catch (err) {
    if (err.status === 404) return res.status(404).json(error(err.message, 404));
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await service.remove(req.user.id, req.params.id);
    res.json(success(result));
  } catch (err) {
    if (err.status === 404) return res.status(404).json(error(err.message, 404));
    next(err);
  }
}

module.exports = { getAll, getOne, create, update, remove };