const nodemailer = require("nodemailer");
var fs = require("fs");

const loginTemp = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
<div style="margin:50px auto;width:70%;padding:20px 0">
  <div style="border-bottom:1px solid #eee">
    <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Your Brand</a>
  </div>
  <p style="font-size:1.1em">Hi,</p>
  <p>Thank you for choosing Your Brand. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
  <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">324457</h2>
  <p style="font-size:0.9em;">Regards,<br />Your Brand</p>
  <hr style="border:none;border-top:1px solid #eee" />
  <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
    <p>Your Brand Inc</p>
    <p>1600 Amphitheatre Parkway</p>
    <p>California</p>
  </div>
</div>
</div>`;
const mail = async ({ email, message, subject, otp }) => {
  let transporter = nodemailer.createTransport({
    // for sending mail by using spacific mail
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "mail@digisidekick.com",
      pass: "one2three4five6",
    },
  });
  let info = await transporter.sendMail({
    from: "<noreply@temporary.com>", // sender address
    to: email, // list of receivers
    subject: "Test Template",
    // plain text body
    html: loginTemp, // html body
  });
  console.log(info, "infoinfoinfoinfoinfoinfoinfoinfo");
  fs.appendFile("mynewfile1.txt", JSON.stringify(info), function (err) {
    if (err) throw err;
    console.log("Saved!");
  });
  return info;
};

module.exports = mail;
