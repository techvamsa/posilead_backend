const jwt = require("jsonwebtoken");
const handleError = require("../util/handleError");

const verifyToken = (req,res,next) =>{
    const authHeader = req.headers.token;
    if(authHeader){
        jwt.verify(authHeader,process.env.JWT_SECRET_KEY,(err,user)=>{
            if(err){
                next(err)
            }
            req.user = user;
            next();
        })
    }
    else{
        return next(handleError(403,"You are not authenticated"))
    }

}


const verifyTokenAndAdmin = (req,res,next) =>{
    verifyToken(req,res,()=>{
        if(req.user.isAdmin){
            next()
        }else{
            return next(handleError(403, "you are not allowded to do that!"));
            
        }
    })

}


const verifyTokenAndAuthorization = (req,res,next) =>{
    verifyToken(req,res,()=>{
        if(req.user.id === req.params.id || req.user.isAdmin){
            next()
        }else{
            return next(handleError(403, "you are not allowded to do that!"));
            
         
        }
    })
}

module.exports = {verifyToken,verifyTokenAndAdmin,verifyTokenAndAuthorization }