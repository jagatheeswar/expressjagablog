const jwt = require('jsonwebtoken')
const Register = require('../models/registers')
const bcrypt = require('bcrypt');

 const iscookieset = (req, res, next)=> {
    if(req.cookies['jwt'])
        auth(req, res, next);
    else
        next();
}	

const auth = async (req,res,next) =>{
    try{
        const token = req.cookies.jwt
        if(!token){
            
        console.log("no cookie")
        throw new Error("no cookie")}
            
        const verifyuser = await jwt.verify(token,process.env.SECRET)

        res.locals.userId = verifyuser._id
      next()
    } 
    catch(error){
        res.redirect("/auth/login");
    }
}

module.exports = {
    iscookieset,
    auth
}