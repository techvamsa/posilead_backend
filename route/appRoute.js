const router = require("express").Router();
const {getApp,postApp,putApp,deleteApp,Appdetails,getAppByPage, subscribePageInApp, UnsubscribePageInApp, getAppByAppId, GeneratePermanentToken} = require("../controller/Appcontroller");




router.get("/",getApp)
router.post("/findAppUsingPageId",getAppByPage)
router.post("/getAppByAppId",getAppByAppId)
router.post("/",postApp)
router.put("/:id",putApp)
router.delete("/:id",deleteApp)
router.get("/:id",Appdetails)
router.post("/subscribePageInApp",subscribePageInApp)
router.post("/UnsubscribePageInApp",UnsubscribePageInApp)
router.post("/GeneratePermanentToken",GeneratePermanentToken)




module.exports = router
