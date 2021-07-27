const mongoose =  require('mongoose');
mongoose.connect(process.env.MONGODBURL,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log('connected successfully')
}).catch((e)=>console.log("connected unsuccessful"+ e))
mongoose.connection.on