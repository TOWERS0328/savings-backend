const service = require('./tips.service');
const { success, error } = require('../../utils/response');

async function getToday(req, res, next) {
  try {
    const result = await service.getTodayTip(req.user.id);
    res.json(success(result));
  } catch (err) { next(err); }
}

async function getAll(req, res, next) {
  try {
    const result = await service.getAll(req.user.id);
    res.json(success(result));
  } catch (err) { next(err); }
}

async function markAsRead(req, res, next) {
  try {
    const result = await service.markAsRead(req.user.id, req.params.id);
    res.json(success(result));
  } catch (err) {
    if (err.status === 404) return res.status(404).json(error(err.message, 404));
    next(err);
  }
}

module.exports = { getToday, getAll, markAsRead };