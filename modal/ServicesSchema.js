const mongoose = require("mongoose");

const ServicesSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: true,
    },
    User: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Services", ServicesSchema);
