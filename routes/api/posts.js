
const express= require('express')
const router=express.Router()
const {check,validationResult}=require('express-validator')
const auth=require('../../middleware/auth')
const Post=require('../../models/Post')
const User=require('../../models/Users')
const Profile=require('../../models/Profile')
//@route post api/posts
//@desc Test route
//@access private
router.post('/',[auth ,[
    check('text','Text is required').notEmpty()
]],async (req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
   try {
    const user=await User.findById(req.user.id).select('-password');
    const newPost= new Post({
        text:req.body.text,
        name:user.name,
        avtar:user.avtar,
        user:req.user.id
 
    })
    const post=await newPost.save();
    res.json(post);
       
   } catch (err) {
       console.log(err.message)
       res.status(500).json('Server Error')
       
   }
})
//@route get api/posts
//@desc get all  route
//@access private\
router.get('/',auth,async (req,res)=>{
    try {
        const posts=await Post.find().sort({date:-1});
    res.json(posts);
    } catch (err) {
        console.log(err.message)
        res.status(500).json('Server Error')
        
    }
    
})
router.get('/:id',auth,async(req,res)=>{
    try {
        const post =await Post.findById(req.params.id)
        if(!post){
            return res.status(400).json({msg:'Post not found'})
        }
        res.json(post);
        
    } catch (err) {
        if(err.kind === 'ObjectId'){
            return res.status(400).json({msg:'Post not found'})
        }
        console.log(err.message)
        res.status(500).json('Server Error')
        
        
    }
})
//@route delete api/posts
//@desc delete routes
//@access private
router.delete('/:id',auth,async (req,res)=>{
    try {
        const post=await Post.findById(req.params.id);
        if(!post){
            return res.status(400).json({msg:'Post not found'})
        }

        if(post.user.toString() != req.user.id){
            return res.status(401).json({msg:'User not authorized'})
        }
    await post.remove()

    console.log(post.user.toString())
    console.log(post.user)
    res.json({msg:'Post removed'})


    } catch (err) {
        if(err.kind === 'ObjectId'){
            return res.status(400).json({msg:'Post not found'})
        }
        console.log(err.message)
        res.status(500).json('Server Error')
        
    }
    
})
//@route patch api/posts/like/id
//@desc like a post
//@access private
router.patch('/like/:id',auth,async (req,res)=>{
    try {
        const post =await Post.findById(req.params.id)
        //check if the post has already been liked
        if(post.likes.filter(like=>like.user.toString() === req.user.id).length>0){
        return res.status(400).json({msg:"post already liked"});}
 
    post.likes.unshift({user:req.user.id});
    await post.save()
    res.json(post.likes);   } 
    catch (err) {
        console.log(err.message)
        res.status(500).json('Server Error')
    }
})
//@route patch api/posts/unlikelike/id
//@desc unlike a post
//@access private
router.patch('/unlike/:id',auth,async (req,res)=>{
    try {
        const post =await Post.findById(req.params.id)
        //check if the post has already been liked
        if(post.likes.filter(like=>like.user.toString() === req.user.id).length===0){
    
        return res.status(400).json({msg:"post has not yet been liked"});}
 
        const removeIndex=post.likes.map(like=>like.user.toString())
        .indexOf(req.user.id);
        post.likes.splice(removeIndex,1)
        await post.save();
        res.send(post.likes)
    } 
    catch (err) {
        console.log(err.message)
        res.status(500).json('Server Error')
    }
})

//@route post api/posts/comment/:id
//@desc comment on a post
//@access private
router.post('/comment/:id',[auth ,[
    check('text','Text is required').notEmpty()
]],async (req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
   try {
    const user=await User.findById(req.user.id).select('-password');
    const post=await Post.findById(req.params.id);
    const newComment= {
        text:req.body.text,
        name:user.name,
        avtar:user.avtar,
        user:req.user.id
 
    };
    post.comments.unshift(newComment);
    await post.save()
    res.json(post.comments);
       
   } catch (err) {
       console.log(err.message)
       res.status(500).json('Server Error')
       
   }
})
//@route delete api/posts/comment/:id/:comment_id
//@desc delete comment on a post
//@access private

router.delete('/comment/:id/:comment_id',auth,async(req,res)=>{
    try {
        const post=await Post.findById(req.params.id);
        //pull out comment from the post
        const comment=post.comments.find((comment)=>comment.id===req.params.comment_id)
        //make sure commnet exists

        if(!comment){
            return res.status(404).json({msg:"Comment does not exists"});

        }
        //check user
        if(comment.user.toString()!=req.user.id){
            return res.status(401).json({msg:"User not authorized"});

        }
        const removeIndex=post.comments.map(comment=>comment.user.toString())
        .indexOf(req.user.id);
        post.comments.splice(removeIndex,1)
        await post.save();
        res.send(post.comments)
        res.send('comment deleted')
    } 
    catch (err) {
        console.log(err.message)
        res.status(500).json('Server Error')
    }
})

module.exports=router;
