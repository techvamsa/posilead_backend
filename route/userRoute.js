const router = require("express").Router();
const {getUser, postUser, putUser, deleteUser, userDetails,login,userprofile, UnsubscribePageWithUser,addService, SubscribePageWithUser,UpdatePassword,forgotPassword, setNewPassword, addUrlData, DeleteUrlData} = require("../controller/UserController");
const {verifyToken, verifyTokenAndAuthorization} = require("../util/verifyToken")

router.get("/",getUser)
router.post("/",postUser)
router.put("/:id",putUser)
router.delete("/:id",deleteUser)
router.get("/:id",userDetails)
router.post("/UnsubscribePageWithUser",UnsubscribePageWithUser)
router.post("/SubscribePageWithUser",SubscribePageWithUser)
router.post("/login",login)
router.get("/accesstoken/me",verifyToken,userprofile)
router.post("/addservice/:userId",addService)
router.post("/UpdatePassword/:id",UpdatePassword)
router.post("/forgotPassword",forgotPassword)
router.post("/setNewPassword",setNewPassword)
router.put("/addUrlData/:id",addUrlData)
router.put("/DeleteUrlData/:id",DeleteUrlData)







module.exports = router