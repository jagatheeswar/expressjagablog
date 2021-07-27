const express = require('express')
const app = express()
const multer= require('multer')
const path = require('path')
const authrouter = express.Router()
const postrouter = express.Router()
const Register = require("./src/models/registers").Register
const Blog = require("./src/models/registers").Blog
var jwt= require('jsonwebtoken');
const bcrypt = require('bcrypt');
const session = require('express-session')
const auth = require('./src/middleware/authentication').auth
const paginate = require('express-paginate');
app.use(express.static("public"));
var Storage = multer.diskStorage(
    {
    destination:"./public/uploads/",
    filename:(req,file,cb)=>{
       
        cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname))
        
    }
});

var upload = multer({
    storage:Storage,
    
})

app.use(express.json());
app.use(express.urlencoded({extended:false}));

authrouter.get('/register',(req,res)=>{
    res.render('register.ejs')
})

authrouter.post('/register',upload.single('file'), async(req,res)=>{
    
    try{
        var imagefile = "account.jpg"
        const password = req.body.password
            
        const cpassword = req.body.cpassword
        if(cpassword === password){
            //creating new instance

            var registerUser = {
                username:req.body.username,
                email:req.body.email,
                password:req.body.password,
                cpassword:req.body.cpassword,
                image: imagefile
        }

        //password hash
        const user= await new Register(registerUser);
            const registered = await user.save()
    
            res.redirect('login');
        }
    else{
       
        res.redirect('register')
    }}
    catch(e){
    
        res.redirect('register');
    
    }
})
authrouter.get('/login',(req,res)=>{
    res.render('login.ejs')
})

authrouter.post('/login', async(req,res)=>{
    try
    {
        const email = req.body.email
        const password = req.body.password
        const userobj = await Register.findOne({email:email})
        const ismatch = await bcrypt.compare(password,userobj.password)
        const token =  jwt.sign({_id:userobj._id},"kjskhdjkhskhskjsdkhfskdfjkslfjlksfjlksjdlffd")
        res.cookie("jwt",token,{
            httpOnly:true,
            sameSite: 'none', 
            secure: true
            
        });

        if(ismatch)
        {
            
            req.session.loggedin = true
            res.redirect('/');
    }
        else
        {
        res.redirect('login')
        }
    }
    catch(e)
    {   
        res.redirect("/auth/login")
    }
})
postrouter.get('/',auth,async(req,res,next)=>{
    try{
        const [ results, itemCount ] = await Promise.all([
            Blog.find().populate('author').limit(req.query.limit).skip(req.skip).lean().exec(),
            Blog.count({})
          ]);
        const pageCount = Math.ceil(itemCount / req.query.limit);
                var page = req.query.page || 1
          
        var options= {
			authorized_userId: res.locals.userId,
			results,
            pages: paginate.getArrayPages(req)(3, pageCount, req.query.page),
            pagecount : pageCount,
            current:page
		};
        
		res.render('blogpage', options);
	}
	catch(e){
		res.redirect("/")
	}

})
postrouter.get('/new',auth,(req,res)=>{
    res.render('new')
    
})
postrouter.post('/new',upload.single('file'),auth,async(req,res,next)=>{
    try{
        var imagefile = req.file.filename
        
        var newblog = new Blog({
                
            title:req.body.title||"hello",
            content:req.body.content,
            tag:req.body.tags,
            author:res.locals.userId,
            image:imagefile
    })
	await newblog.save();
		const user= await Blog.findOne({_id : res.locals.userId});		
		res.redirect('/');
    }
    catch(e){
        console.log(e);
    }
})
postrouter.get('/user/:userid/:username',auth, async(req, res)=>{
	
    try{
        const [ result, itemCount ] = await Promise.all([
            Blog.find({ author: req.params.userid }).populate('author').limit(req.query.limit).skip(req.skip).lean().exec(),
            Blog.count({author: req.params.userid})
          ]);
       
        const pageCount = Math.ceil(itemCount / req.query.limit);
        
        var page = req.query.page || 1
          
        var options= {
			authorized_userId: res.locals.userId,
            username:req.params.username,
			result,
            pages: paginate.getArrayPages(req)(3, pageCount, req.query.page),
            pagecount : pageCount,
            current:page
		};
		res.render('userprofile', options);
	}
	catch(e){
		console.log(e);
	}

});

postrouter.get('/read/:postid',auth,async(req, res,next)=>{
    try{
			const postFound= await Blog.findOne({ _id: req.params.postid }).populate('author')   
		    res.render('detailview', {result: postFound ,authorized_userId: res.locals.userId});
    }
    catch(e){
        console.log(e)
    }
});
postrouter.post('/filter',auth,async(req,res,next)=>{
    try{
        console.log(req.body.tagfilter)
        var tagname = await req.body.tagfilter;
            console.log(typeof tagname)
    var result = await Blog.find({tag:tagname}).populate('author')
        res.render('filterpage',{result:result})
}
    catch(e){
        console.log(e);
    }
})
authrouter.get('/logout', (req, res)=>{
	res.clearCookie('jwt');
	req.session.destroy((err) => {
		res.redirect('/auth/login') // will always fire after session is destroyed
	  })

});
postrouter.delete('/delete',auth, async(req, res)=>{
	try{
		const blogToDelete= req.headers.blogid;
		const blogInDB= await Blog.findById(blogToDelete).populate("author");
		const author= blogInDB.author;
		if(author.id === res.locals.userId){
			const deletedBlog= await blogInDB.delete();
		}

		else
			res.status(402);
			
		res.end();
	}
	catch(e){
		console.log(e);
	}
});
module.exports = {
    authrouter,
    postrouter
}