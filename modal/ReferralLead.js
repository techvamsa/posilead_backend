const mongoose = require("mongoose");

const ReferralLead = new mongoose.Schema(
  {
    full_name: {
      type: String,
      // required:true
    },
    email: {
      type: String,
      // required:true
    },
    phone_number: {
      type: String,
      // required:true
    },
    LeadType: {
      type: String,
      default: "NEW LEAD",
    },
    isAssigned: {
      type: Boolean,
      default: false,
    },
    salesPerson: {
      type: Object,
      // required:true
    },
    Gender: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    LeadReferral: {
      type: String,
    },
    User: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    Services: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Services",
      
    },

  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.model("ReferralLead", ReferralLead);
