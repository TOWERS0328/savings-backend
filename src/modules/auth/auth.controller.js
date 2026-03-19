const authService = require('./auth.service');
const { success, error } = require('../../utils/response');

async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(success(result));
  } catch (err) {
    if (err.code === 'P2002')
      return res.status(409).json(error('El email ya está registrado', 409));
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(success(result));
  } catch (err) {
    if (err.status === 401)
      return res.status(401).json(error(err.message, 401));
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.getProfile(req.user.id);
    res.json(success(user));
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    res.json(success(user));
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const result = await authService.changePassword(req.user.id, req.body);
    res.json(success(result));
  } catch (err) {
    if (err.status === 400)
      return res.status(400).json(error(err.message, 400));
    next(err);
  }
}

async function uploadPhoto(req, res, next) {
  try {
    if (!req.fileUrl)
      return res.status(400).json(error('No se recibió ningún archivo', 400));
    await authService.updateProfile(req.user.id, { profile_photo_url: req.fileUrl });
    res.json(success({ profilePhotoUrl: req.fileUrl }));
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me, updateProfile, changePassword, uploadPhoto };