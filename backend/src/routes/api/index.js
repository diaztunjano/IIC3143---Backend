require('dotenv').config();

const KoaRouter = require('koa-router');
const jwt = require('koa-jwt');
const { apiSetCurrentUser } = require('../../middlewares/auth');

const users = require('./user');

const router = new KoaRouter({ prefix: '/api' });

router.use(jwt({ secret: process.env.JWT_SECRET, key: 'authData' }));
router.use(apiSetCurrentUser);
router.use('/user', users.routes());

module.exports = router;
