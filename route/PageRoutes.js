const router = require("express").Router();
const {
  postPageSchema,
  findUserPages,
  getPageById,
  setLeadType,
  setAssignedLead,
  setServicesToForm,
  updatePage,
  getLeadsData,
  addSalesPersonToLeads,
  addOrEditComment,
  getAllSalesPersonForms,
  testPostLead,
  getTotalNoOfPerviousDayLeads,
  getDashBoardData,
  graphData,
  getThisMonthGraph,
  getLeadsByTime,
  addCustomsField,
  addOrEditCallLog,
  deleteTableKey,
  addFieldsToServices,
  deleteTableAllKey,
  addMultipleKeyAtTime,
  getLeadsByTimeForSalesPerson,
  getSalesPersonLeads,
  getCallLogs,
  AddFieldToLeads,
  salesPersonLeadsFilter,
  AssignedLeadToSalesPersonInBulks,
  getThisMonthGraphForSalesPerson,
  getKeys,
} = require("../controller/PageController");
router.get("/:id", getPageById);
router.post("/", postPageSchema);
router.put("/updatePage/:id", updatePage);
router.post("/findUserPages", findUserPages);
router.put("/setLeadType", setLeadType);
router.put("/setAssignedLead", setAssignedLead);
router.put("/setServicesToForm", setServicesToForm);
router.post("/getLeadsData", getLeadsData);
router.post("/addSalesPersonToLeads", addSalesPersonToLeads);
router.put("/addOrEditComment", addOrEditComment);
router.post("/getAllSalesPersonForms", getAllSalesPersonForms);
router.post("/testPostLead", testPostLead);
router.post("/getTotalNoOfPerviousDayLeads", getTotalNoOfPerviousDayLeads);
router.post("/getDashBoardData", getDashBoardData);
router.post("/graphData", graphData);
router.post("/getThisMonthGraph", getThisMonthGraph);
router.post("/getLeadsByTime", getLeadsByTime);
router.post("/getLeadsByTimeForSalesPerson", getLeadsByTimeForSalesPerson);
router.put("/deleteTableKey", deleteTableKey);
router.put("/addCustomsField", addCustomsField);
router.put("/addOrEditCallLog", addOrEditCallLog);
router.put("/addFieldsToServices", addFieldsToServices);
router.put("/deleteTableAllKey", deleteTableAllKey);
router.put("/addMultipleKeyAtTime", addMultipleKeyAtTime);
router.post("/getSalesPersonLeads", getSalesPersonLeads);
router.get("/get/CallLogs", getCallLogs);
router.post("/AddFieldToLeads", AddFieldToLeads);
router.post("/salesPersonLeadsFilter", salesPersonLeadsFilter);
router.post("/AssignedLeadToSalesPersonInBulks", AssignedLeadToSalesPersonInBulks);
router.post("/getThisMonthGraphForSalesPerson",getThisMonthGraphForSalesPerson );
router.post("/getKeys",getKeys );


module.exports = router;
