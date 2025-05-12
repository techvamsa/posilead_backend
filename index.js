const express = require("express");
const { default: mongoose } = require("mongoose");
const app = express();
var compression = require("compression");
const approute = require("./route/appRoute");
const userroute = require("./route/userRoute");
const dotenv = require("dotenv");
const cors = require("cors");
const leadRoute = require("./route/leadRoute");
const webHook = require("./route/webHookRoute");
const working = require("./route/working");
const Page = require("./route/PageRoutes");
const Services = require("./route/ServicesRouter");
const salesPerson = require("./route/salesPersonRouter");
const report = require("./route/report");
const whatsApp = require("./route/whatsAppMessageing");
const ReferralLead = require("./route/ReferralLeadRoutes");
const { testCronJob } = require("./controller/WhatsappMessaging");


dotenv.config();
app.use(express.json({
  limit: "10mb",
  extended:true,
}));
app.use(cors({ origin: true, credentials: true }));

const PORT = process.env.port || 5000;

app.use(compression({ filter: shouldCompress, level: 6 }));

function shouldCompress(req, res) {
  if (req.headers["x-no-compression"]) {
    // don't compress responses with this request header
    return false;
  }
  // fallback to standard filter function
  return compression.filter(req, res);
}
app.use("/api/app/", approute);
app.use("/api/user", userroute);
app.use("/api/whatsapp", whatsApp);
app.use("/api/lead", leadRoute);
app.use("/api/page", Page);
app.use("/api/report", report);
app.use("/api/Services", Services);
app.use("/api/salesPerson", salesPerson);
app.use("/api/referralLead", ReferralLead);
app.use("/webHook", webHook);
app.use("/working", working);
app.use("/testCronJob", testCronJob);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to Mongodb");
  })
  .catch((err) => {
    console.log(err);
  });
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something Went Wrong";
  return res.status(status).json({
    success: false,
    status,
    message,
  });
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
