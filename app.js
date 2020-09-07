const koa =require('koa')
const Router =require('koa-router')
const mongoose=require('mongoose')
var bodyParser = require('koa-bodyparser')   //帮助后台获取前端请求的数据
const passport = require('koa-passport')
//实例化koa
const app=new koa()
const router =new Router()
app.use(bodyParser());


//引入users.js
const users=require('./routes/api/user')

//连接数据库
mongoose.connect('mongodb://localhost/koa',{useNewUrlParser: true}) 
.then(() => {
    console.log('连接数据库成功!!!')
    // 只有当连接上数据库后才去启动服务器
  })
  .catch(error => {
    console.error('连接数据库失败', error)
  })
  
  app.use(passport.initialize())//passport初始化
  app.use(passport.session())

//回调到config文件中 passport.js
require('./config/passport')(passport);



//路由
router.get('/',async (ctx)=>{
    ctx.body="首页";

})






//配置路由地址localhost:5000/api/users
router.use('/api/users',users)



app.use(router.routes());   /*启动路由*/
app.use(router.allowedMethods());

app.listen(5000,()=>{
    console.log(`server started on 5000 !`);
});