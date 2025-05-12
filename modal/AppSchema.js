const mongoose  = require("mongoose");

const appSchema = new mongoose.Schema({
    AppID:{
        type:String,
        unique:true,
        required:true
    },
    AppName:{
        type:String,
        required:true
    },
    AppSecret:{
        type:String,
        unique:true,
        required:true
    },
    LeadFormID:{
        type:[String]
    },
    Pages:{
        type:[String],
        // required:true
    },
    PermanentAccessToken:{
        type:String,
        required:true
    },
    AccountId:{
        type:String,
    },
    leadDistribution:{
        type:String,
        enum :["AUTOMATIC","MANUAL"], 
    },
    expires_in:{
        type:String,
        required:true
    }
},{timestamps:true})


module.exports = mongoose.model("App",appSchema)