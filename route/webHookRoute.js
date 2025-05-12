const router = require("express").Router();
const {
  getWebhook,
  postWebhook,
  postLeadData,
  checkPostWebhook,
  whatsAppWebHook,
  PostWhatsAppWebHook,
} = require("../controller/webhook");
const mail = require("../util/nodeMailer");

router.get("/", getWebhook);
router.post("/", postWebhook);
router.get("/whatsAppWebHook", whatsAppWebHook);
router.post("/whatsAppWebHook", PostWhatsAppWebHook);
router.get("/text", checkPostWebhook);
router.get("/emailSender", async (req, res, next) => {
  try {
    const arr = [
      "ravibaba2022@gmail.com",
      "ravi@digisidekick.com",
      "ravibaba2722@digisidekick.com",
      "mamagupta071922222222222222222222@gmail.com",
      "aapkesaathi.workspaces@gmail.com",
      "vaishnavig1010@gmail.com",
      "Rakshagupta@gmail.com",
      "aayushseth73@gmail.com",
      "vaishnavig@gmail.com",
      "Umeshgupta0719@gmail.com",
      "Umeshgupta071922222222222222222222@gmail.com",
    ];
    await arr.forEach(async (email) => {
      try {
        const info = await mail({ email:email });
      } catch (error) {
        console.log(error);
      }
    });
    return res.status(400).json({ message: myResponse, susses: true });
  } catch (error) {
    return res.status(400).json({ message: error, susses: false });
  }
});

module.exports = router;
