const router = require("express").Router();
const {CsvToJson, jsoncsv} = require("../controller/LeadController")

router.get("/csv",CsvToJson)
router.get("/",jsoncsv)


module.exports = router