/**
 * 应用程序对象配置
 */

// 内置模块依赖
const path = require('path')

// 载入第三方依赖模块
const express = require('express')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const hbs = require('express-hbs')

const models = require('./models')

// 载入路由表
const routes = require('./routes')

// 创建应用程序对象
const app = express()

// 配置应用所使用的模板引擎
app.set('view engine', 'hbs')

// 配置模板文件所在目录
app.set('views', path.join(__dirname, 'views'))

// 配置 hbs 模板文件的模板引擎
app.engine('hbs', hbs.express4({
  // 指定部分页（被载入的模板）所存在的目录
  // {{> member-sidebar}}
  partialsDir: path.join(app.get('views'), 'partials')
}))

// 定制一个判断是否相等的 helper
hbs.registerHelper('equal', function (a, b, opts) {
  return a === b ? opts.fn(this) : opts.inverse(this)
  // opts.fn 执行结果是 else 之前的内容
  // opts.inverse 执行结果是 else 之后的内容
  // console.log(opts.inverse())
  // return a + b
  // https://github.com/helpers/handlebars-helpers
})

hbs.registerHelper('foo', function (opts) {
  // 如果你是开闭标签的方式 一般会用到 opts.fn 和 opts.inverse
  // 如果是单标签的方式使用 一般是 return 一个字符串
  // fn 或者 inverse 的参数就是这对标签中间的数据作用域
  // 这个函数中的 this 就是全局数据成员
  return opts.fn(this)
})

hbs.registerAsyncHelper('categories', function (opts, callback) {
  // 查询到全部分类数据并递归成为一个树状结构
  models.Category.findAll({ where: { cat_deleted: 0 } })
    .then(categories => {
      function foo (pid) {
        return categories
          .filter(s => s.cat_pid === pid)
          .map(c => {
            c.children = foo(c.cat_id)
            return c
          })
      }
      
      const result = opts.fn({ categories: foo(0) })
      callback(result)
    })
})

// 载入所需的中间件

// 请求日志
app.use(morgan('dev'))

// public 文件夹的静态文件服务
app.use(express.static(path.join(__dirname, 'public')))

// json 格式请求体解析
app.use(bodyParser.json())

// urlencoded 格式请求体解析
app.use(bodyParser.urlencoded({ extended: false }))

// 请求头中的 cookie 解析
app.use(cookieParser())

// 支持 Session
app.use(session({ secret: 'this is a secret' }))

// 挂载路由表
app.use(routes)

// 处理 404 请求，转发到错误处理器
app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// 错误处理器
app.use((err, req, res, next) => {
  // locals 属性的作用就是 控制器 与 模板 之间的数据通道
  res.locals.status = err.status || 500
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // 设置 HTTP 状态码并渲染错误页面
  res.status(res.locals.status).render('error')
})

// 导出应用程序对象
module.exports = app
