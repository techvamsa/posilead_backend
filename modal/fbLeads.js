const mongoose  = require("mongoose");

const leadsModal = new mongoose.Schema({
    id:{
        type:String,
        // required:true
    },
    created_time:{
        type:String,
        // required:true
    },
    ad_id:{
        type:String
    },
    ad_name:{
        type:String,
        // required:true
    },
    adset_id:{
        type:String,
        // required:true
    },
    adset_name:{
        type:String,
        // required:true
    },
    campaign_id:{
        type:String,
        // required:true
    },
    campaign_name:{
        type:String,
        // required:true
    },
    form_id:{
        type:String,
        // required:true
    },
    form_name:{
        type:String,
        // required:true
    },
    is_organic:{
        type:String,
        // required:true
    },
    platform:{
        type:String,
        // required:true
    },
    email:{
        type:String,
        // required:true
    },
    phone_number:{
        type:String,
        // required:true
    },
    city:{
        type:String,
        // required:true
    },
    
   
},{timestamps:true})


module.exports = mongoose.model("Leads",leadsModal)