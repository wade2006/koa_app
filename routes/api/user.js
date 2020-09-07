const Router =require("koa-router")
const router =new Router()
var gravatar = require('gravatar');
const tools=require('../../config/tool')
const bcrypt=require('bcryptjs')  //密码加密
var jwt = require('jsonwebtoken');//生成token
const passport=require('koa-passport') //验证token是否正确

//引入User
const User=require('../../models/User')

/**
 * @route GET api/users/test
 * @desc 测试接口地址
 * @access 接口是公开的
 */
router.get('/test',async ctx=>{
    ctx.status=200;
    ctx.body={msg:"users work..."}
})


/**
 * @route GET api/users/register
 * @desc 注册接口地址
 * @access 接口是公开的
 */
router.post('/register',async ctx=>{
   
//    console.log(ctx.request.body)  //获取前端提交的内容

   //存储到数据库
   const findResult=await User.find({name:ctx.request.body.name})
   
   if(findResult.length>0){
       ctx.status=500;
       ctx.body={name:'用户名已占用'}   
   }else{
       //没查到
       const avatar=gravatar.url(ctx.request.body.email, {s: '200', r: 'pg', d: 'mm'});
       const newUser=new User({
           name:ctx.request.body.name,
           email:ctx.request.body.email,
           avatar,
           password:tools.enbcrypt(ctx.request.body.password)
       })
    //    console.log(newUser)

    
    //存储到数据库
    await newUser.save().then(user=>{ctx.body=user}).catch(err=>{console.log(err);})

    //返回json数据
    ctx.body=newUser;

   }
   
})


/**
 * @route GET api/users/login
 * @desc 登录接口地址  返回token
 * @access 接口是公开的
 */
router.post('/login',async ctx=>{
    //查询
    const findResult=await User.find({name:ctx.request.body.name})
    const user=findResult[0];
    const password=ctx.request.body.password

    //判断有没有查到
    if(findResult.length==0){
        ctx.status=404;
        ctx.body={email:"用户不存在"}
    }else{
        //查到后验证密码
     var result=await bcrypt.compareSync(password, user.password); // true
     
     //验证通过
     if(result){
     //返回token
     const payload={id:user.id,name:user.name,avatar:user.avatar}
     const token=jwt.sign(payload,"secret",{expiresIn:3600})



         ctx.status=200;
         ctx.body={success:true,token:"Bearen "+token}
     }else{
         ctx.status=400;
         ctx.body={password:'密码错误'}
     }
    }
})


/*current 用户信息接口
 返回用户信息
 接口是私密的
*/
/**
 * @route GET api/users/current
 * @desc 用户信息接口地址  返回用户信息
 * @access 接口是私密的
 */

router.get('/current',passport.authenticate('jwt', { session: false }),async ctx=>{
    ctx.body=ctx.state.user;
})

module.exports=router.routes();