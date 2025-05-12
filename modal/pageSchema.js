const mongoose = require("mongoose");

const PageModal = new mongoose.Schema(
  {
    adgroup_id: {
      type: String,
      // required:true
    },
    appId: {
      type: String,
      // required:true
    },
    ad_id: {
      type: String,
      // required:true
    },
    page_id: {
      type: String,
      // required:true
    },
    pageName:{
      type: String,
    },
    form_id: {
      type: String,
      // required:true
    },
    formName:{
      type: String,
    },
    leads: [
      {
        type: Object,
      },
    ],
    Services: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Services",
    }
  },
  { timestamps: true }
);


module.exports = mongoose.model("Pages", PageModal);
