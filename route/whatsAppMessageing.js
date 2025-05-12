const {
  scheduleWMForConversionLead,
  scheduleWMForHotLead,
  scheduleWMForQualified,
  scheduleWMForNOT_PICKUP,
  postMessageLogs,
  findMessageLogs,
  AllMessageLogs,
  AllMessageLogsByTime,
  sendBulkMessage,
} = require("../controller/WhatsappMessaging");

const router = require("express").Router();

router.post("/", postMessageLogs);
router.post("/AllMessageLogs", AllMessageLogs);
router.post("/AllMessageLogsByTime", AllMessageLogsByTime);
router.get("/findMessageLogs", findMessageLogs);
router.post("/scheduleWMForConversionLead", scheduleWMForConversionLead);
router.post("/scheduleWMForHotLead", scheduleWMForHotLead);
router.post("/scheduleWMForQualified", scheduleWMForQualified);
router.post("/scheduleWMForNOT_PICKUP", scheduleWMForNOT_PICKUP);
router.post("/sendBulkMessage", sendBulkMessage);

module.exports = router;
