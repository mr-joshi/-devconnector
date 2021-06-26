const express= require('express')
const router=express.Router()
const {check,validationResult} =require('express-validator')
const User=require('../../models/Users')
const gravatar=require('gravatar')
const bcrypt=require('bcryptjs')
const jwt=require("jsonwebtoken");
const config=require('config');
//@route Get api/users
//@desc Test route
//@access public
router.post(
    '/',
    check('name', 'Name is required').notEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
     async(req, res) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const {name,email,password}=req.body;


      //if user exists
      try {
        let user =await User.findOne({email});
if(user){
  return res.status(400).json({errors:[{msg:'user already exists'}]})
}
const avatar=gravatar.url(email,{
  s:'200',
  r:'pg',
  d:'mm'
});
user=new User({
  name,email,avatar,password
})
const salt=await bcrypt.genSalt(10);
user.password=await bcrypt.hash(password,salt);
await user.save();

const payload ={
  user:{
    id:user.id
  }
}
jwt.sign(payload,
  config.get('jwtSecret')
  ,{expiresIn:'1w'},

  (err,token)=>{
    if(err) throw err;
    res.json({token})
  }
  )
        
      } catch (err) {
        console.log(err.message);
        res.status(500).send('service error');
        
      }

    

     
       
     
    })
module.exports=router;