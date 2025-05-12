const mongoose = require("mongoose");

const WhatsAppMarketing = new mongoose.Schema(
  {
    full_name: {
      type: String,
      // required:true
    },
    phone_number:{
      type: String,
    },
    email:{
      type: String,
    },
    User: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    page_id: {
      type: String,
      required: true,
    },
    form_id: {
      type: String,
      required: true,
    },
    leadgen_id: {
      type: String,
      required: true,
    },
    message_logs: [
      {
        type: Object,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("WhatsAppMarketing", WhatsAppMarketing);
