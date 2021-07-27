const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique : true
    },

    
    password:{
        type: String,
        required: true
    },
    image:{
        type:String
    },
	blogs:[{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Blog'
	}]
})

var blogSchema= new mongoose.Schema({
	title: {
		type: String,
        default: "hello world",
		required: false
	},
	content: {
		type: String,
		required: true
	},
    tag: {
		type: String,
		required: true
	},
	author:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Register'
	}, 
    image:{
        type:String
    }
});

userSchema.methods.generateAuthToken = async function(){
    try{
        const token =  jwt.sign({_id:this._id},process.env.SECRET)
        this.tokens = this.tokens.concat({token:token})
        await this.save();
        return token;
    }
    catch(error){
res.send("the error "+ error)
    }
}
//hash
userSchema.pre("save",async function(next){
    if(this.isModified('password'))
    {
        this.password = await bcrypt.hash(this.password,10);
    }
    next()
})

const Register = new mongoose.model("Register",userSchema);  //singular form collection name
const Blog = new mongoose.model("Blog",blogSchema);  //singular form collection name

module.exports= { 
	Register,
	Blog
};
