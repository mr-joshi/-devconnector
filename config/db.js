const mongoose=require('mongoose')
const config=require('config');
const { json } = require('express');
const db=config.get('mongoURI');
const connectDB=async()=>{
    try{
     await mongoose.connect(db,{ useUnifiedTopology: true, useNewUrlParser: true ,useCreateIndex:true ,useFindAndModify:false});
     console.log('Mongodb is connected...')
    }
    catch(err){(err.message)
        process.exit(1);};
    ///exit process with failue
  
}
module.exports =connectDB