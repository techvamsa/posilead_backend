const router = require("express").Router();
const {getSalesPerson,postSalesPerson ,putSalesPerson ,deleteSalesPerson,login,salespersonprofile, addUrlData, DeleteUrlData} = require("../controller/salesPersonController");
const { verifyToken } = require("../util/verifyToken");





router.get("/",getSalesPerson)
router.post("/",postSalesPerson)
router.put("/:id",putSalesPerson)
router.delete("/:id",deleteSalesPerson)
router.post("/login",login)
router.get("/accesstoken/me",verifyToken,salespersonprofile)
router.put("/addUrlData/:id",addUrlData)
router.put("/DeleteUrlData/:id",DeleteUrlData)
module.exports = router
