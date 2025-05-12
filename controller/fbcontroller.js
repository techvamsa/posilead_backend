const appSchema = require("../modal/AppSchema");
const axios = require("axios");
const handleError = require("../util/handleError");



const getresult = async(req,res,next) =>{

    try {
        
    } catch (error) {
        
    }

}

const genratepermanentaccesstoken = async(req,res,next)=>{
    try {
    const app = await appSchema.findById(req.params.id);

    const permanentaccessstoken = await axios.get(`https://graph.facebook.com/oauth/access_token?client_id=${app.AppID}&client_secret=${app.AppSecret}&grant_type=fb_exchange_token&fb_exchange_token=${app.TemporaryAccessToken}`);

    const newparmanenttoken = permanentaccessstoken.access_token

    const newapp = new appSchema({
        TemporaryAccessToken:newparmanenttoken
    })

    await newapp.save();
    
    res.status(200).json({
        success:true,
        message:"Permanent Token Updated Successfully"
    })

    // https://graph.facebook.com/oauth/access_token?client_id=851841552636187&client_secret=31ffb1a37625cb4b4d599944171a72bc&grant_type=fb_exchange_token&fb_exchange_token=EAAMGvtEmWRsBAEv5VdhC5HFyw0xhFNNdcuC4RZBtqCHpgxhbma9ViuUydYc1ZCpMxRbFS5ZBABHB9BIn7bKWHyVCP3HypNmsAtoW1NNrKZADjfOBDY4nlZBYPpxaIRHte3kFEhcXZBGFpQqUzAUt6Jnnp1011W9sHAGaLH3Nm0jxIHED7GRK7GfdwUjdxrId6UR87ICC1r2qKqzb47DyA6AZCtmeNWHCJ


    } catch (error) {
        next(handleError(500,"Permanent access Token Not Genrated"))
        
    }

}

module.exports = {getresult,genratepermanentaccesstoken}