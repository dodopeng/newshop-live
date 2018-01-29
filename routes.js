const { Router } = require('express')

const homeController = require('./controllers/home')
const accountController = require('./controllers/account')
const commonController = require('./controllers/common')
const memberController = require('./controllers/member')

// 创建路由对象
const router = new Router()

router.get('/', homeController.index)
router.get('/list', homeController.list)
router.get('/item', homeController.item)

router.get('/account/login', accountController.login)
router.post('/account/login', accountController.loginPost)
router.get('/account/register', accountController.register)
router.post('/account/register', accountController.registerPost)
router.get('/account/active', accountController.active)

router.get('/member', memberController.index)

router.get('/captcha', commonController.captcha)

// 导出路由对象
module.exports = router