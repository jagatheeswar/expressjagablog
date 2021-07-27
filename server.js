const express = require ('express');
const app = express();
const authroute = require('./routes.js').authrouter
const postroute = require('./routes.js').postrouter

const cookieparser = require('cookie-parser')
const bcrypt = require('bcrypt');
const session = require('express-session')
require("./src/db/connection")
const { v4:uuidv4 } = require("uuid");
const paginate = require('express-paginate');

app.set('port', process.env.PORT || 9000);
app.use(session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true,
    cookie:{maxAge:3600000}
}));
app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});
app.use(paginate.middleware(5, 50));
app.use(express.static("public"));
app.set('view engine','ejs')
app.use(cookieparser())
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use('/auth',authroute)
app.use('/',postroute)

app.get("*",(req,res) => {
    res.sendFile(__dirname + "/404.html")
  
})

app.listen(
	app.get('port'), ()=>{
		console.log(`App listening in port ${app.get("port")}`);
	}); 
