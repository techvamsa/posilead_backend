const router = require("express").Router();
const {getServices,postServices ,putServices ,deleteServices, getUserServicesMultiForms} = require("../controller/ServiceController");




router.get("/",getServices)
router.post("/",postServices)
router.put("/:id",putServices)
router.delete("/:id",deleteServices)





module.exports = router
