const express= require('express')
const router=express.Router()
const auth=require('../../middleware/auth')
const Profile=require('../../models/Profile')
const User=require('../../models/Users')
const {check,validationResult} =require('express-validator')

const { findOneAndRemove } = require('../../models/Profile')


//@route Get api/profile/me
//@desc get current profile
//@access private
router.get('/me',auth,async(req,res)=>{
try {

    const profile=await ( Profile.findOne({
        
        user:req.user.id})).populate('user', ['name', 'avatar']);
    if(!profile){
        return res.status(400).json({msg:'no profilefor this user'})

    }
    res.json(profile);
    

} catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
    
}
});
//@route Get api/profile
//@desc create or update user profile
//@access private
router.post('/',[auth,[
    check('status','status is required').notEmpty(),
    check('skills','skills is required').notEmpty(),
]
],async(req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        twitter,
        instagram,
        linkedin,
        facebook,
      } = req.body;
      //build profile object
      const profileFields={};
      profileFields.user=req.user.id;
      if(company) profileFields.company=company;
      if (website) profileFields.website=website;
      if (location) profileFields.location=location;
      if(status) profileFields.status=status;
      if(bio) profileFields.bio=bio;
      if (githubusername) profileFields.githubusername=githubusername;
      if(skills){
          profileFields.skills=skills.split(',').map(skill=>skill.trim());
      }
      //build social objects
      profileFields.social={}
      if(youtube) profileFields.social.youtube=youtube;
      if(twitter) profileFields.social.twitter=twitter;
      if(facebook) profileFields.social.facebook=facebook;
      if(linkedin) profileFields.social.linkedin=linkedin;
      if (instagram) profileFields.social.instagram=instagram;

      try {
          let profile =await Profile.findOne({user:req.user.id})
 
         if(profile)
         {
             profile=await Profile.findOneAndUpdate(
                 {user:req.user.id},
                 {$set:profileFields},
                 {new:true}
             )
             return res.json(profile)
         };
    
         profile=new Profile(profileFields);
         await profile.save();
         res.json(profile)
     
         

      } catch (err) {
        console.log(err.message)
        res.status(500).send('Server Error');  
      }

});
//@route Get api/profile
//@desc get all profiles
//@access public
router.get('/',async(req,res)=>{
try {
    const profiles=await Profile.find().populate('user',['name','avatar']);
    res.json(profiles)

    
} catch (err) {
    console.log(err.message)
    res.send(500).send('server error')
    
}

})

//@route Get api/profile/user/:user_id
//@desc get all profiles bu user id
//@access public
router.get('/user/:user_id',async(req,res)=>{
    try {
        const profile=await Profile.findOne({user:req.params.user_id}).populate('user',['name','avatar']);
       if(!profile){
           return res.status(400).json({msg:"profile not found"})
       }
        res.json(profile)
    
        
    } catch (err) {
        if(err.kind=='ObjectId'){
            return res.status(400).json({masg:" profile not found"})
        }

        console.log(err.message)
        res.send(500).send('server error')
        
    }
    
    })
    //@route delete api/profile
//@desc delete profile,user,posts
//@access private
router.delete('/',auth,async(req,res)=>{
    try {
        //remove users posts
        //remove profile
 await Profile.findOneAndRemove({user:req.user.id});
 //remove user
 await User.findOneAndRemove({_id:req.user.id});

        res.json({msg:'user deleted'})
    
        
    } catch (err) {
        console.log(err.message)
        res.send(500).send('server error')
        
    }
    
    })

//@route patch api/profile/experiance
//@desc add profile experiance
//@access private
router.patch('/experience',[auth,[
    check('title','Title is required').notEmpty(),
    check('company','Company is required').notEmpty(),
    check('from','From date is required').notEmpty(),

]],async(req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
const{
    title,
    company,
    location,
    from,
    to,current,
    description
}=req.body;
const newExp={
    title,
    company,
    location,
    from,
    to,current,
    description

}
try {
    const profile =await Profile.findOne({user:req.user.id})
    profile.experience.unshift(newExp);
await profile.save();
res.json(profile);

} catch (err) {
    console.log(err.message)
    res.status(500).send('server error')
    
}


})
//@route delete api/profile/experiance/:exp_id
//@desc delete experiance from profile
//@access private


//i have to do this


router.delete('/experience/:exp_id',auth,async (req,res)=>{
   
    try {
   
  console.log(req.body);
        const  user = await Profile.findOne({"user":req.params.exp_id})
        user.experience = user.experience.filter((exp)=>{
            return exp._id != req.body.expp_id
        })
        await user.save(); 
  

   
     return res.send('removed')


       
        
    } catch (err) {
        console.log(err.message)
        res.status(500).json("server error")
        
    }
})



//@route patch api/profile/education
//@desc add profile 
//@access private

router.patch('/education',[auth,[
    check('school','Dchool is required').notEmpty(),
    check('degree','Degree is required').notEmpty(),
    check('fieldofstudy','Fieldofstudy is required').notEmpty(),
  check('from','From date is required').notEmpty(),

]],async(req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
const{
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description,    

}=req.body;
const newEdu={
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description,

}
try {
    const profile =await Profile.findOne({user:req.user.id})
    profile.education.unshift(newEdu);
await profile.save();
res.json(profile);

} catch (err) {
    console.log(err.message)
    res.status(500).send('server error')
    
}


})
//@route delete api/profile/experiance/:exp_id
//@desc delete experiance from profile
//@access private


//i have to do this

router.delete('/education/:edu_id',auth,async (req,res)=>{
    try {
   

        const  user = await Profile.findOne({"user":req.params.edu_id})

        user.education = user.education.filter((edu)=>{
              return edu._id != req.body.eduu_id
        })
        await user.save(); 
  

   
     return res.send('removed')


        
    } catch (err) {
        console.log(err.message)
        res.status(500).json("server error")
        
    }
})


    

module.exports=router;
