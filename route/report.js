const router = require("express").Router();
const { getLeadCountByServices, getSalesPersonLeadsCount, getSalesPersonLeadTypeCount, getThisMonthGraphByTime, getReportLeadTypeByType, getTotalNoOfLeads, getTotalNoOfLeadsType, getTotalNoOfLeadsForSalesPerson, getReportLeadTypeByTypeForSalesPerson } = require("../controller/ReportController");

router.post("/getLeadCountByServices", getLeadCountByServices);
router.post("/getSalesPersonLeadsCount", getSalesPersonLeadsCount);
router.post("/getSalesPersonLeadTypeCount", getSalesPersonLeadTypeCount);
router.post("/getThisMonthGraphByTime", getThisMonthGraphByTime);
router.post("/getReportLeadTypeByType", getReportLeadTypeByType);
router.post("/getTotalNoOfLeads", getTotalNoOfLeads);
router.post("/getTotalNoOfLeadsType", getTotalNoOfLeadsType);
router.post("/getTotalNoOfLeadsForSalesPerson", getTotalNoOfLeadsForSalesPerson);
router.post("/getReportLeadTypeByTypeForSalesPerson", getReportLeadTypeByTypeForSalesPerson);

module.exports = router;
