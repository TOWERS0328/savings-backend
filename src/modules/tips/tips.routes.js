const router = require('express').Router();
const ctrl = require('./tips.controller');
const auth = require('../../middlewares/auth');

router.get('/today',     auth, ctrl.getToday);
router.get('/',          auth, ctrl.getAll);
router.put('/:id/read',  auth, ctrl.markAsRead);

module.exports = router;
