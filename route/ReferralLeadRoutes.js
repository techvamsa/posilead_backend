const router = require("express").Router();
const { getReferralLead, postReferralLead, putReferralLead, deleteReferralLead, getReferralLeadByTime, ReferralLeadAction, getReferralLeadBYFilter, createBulkLead, searchLeadByName, searchAllByFilter } = require("../controller/ReferralLeadController");
router.get("/",getReferralLead)
router.post("/getReferralLeadByTime",getReferralLeadByTime)
router.post("/",postReferralLead)
router.put("/:id",putReferralLead)
router.delete("/:id",deleteReferralLead)
router.put("/ReferralLeadAction",ReferralLeadAction)
router.post("/getReferralLeadBYFilter",getReferralLeadBYFilter)
router.post("/createBulkLead",createBulkLead)
router.get("/search/LeadByName",searchLeadByName)
router.post("/searchAllByFilter",searchAllByFilter)



module.exports = router
