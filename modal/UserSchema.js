const mongoose = require("mongoose");
const salesPerson = require("./salesPerson");

const userSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      // required:true
    },
    Email: {
      type: String,
      unique: true,
      required: true,
    },
    Password: {
      type: String,
      required: true,
    },
    AdAccountId: {
      type: String,
      // required:true
    },
    AppId: {
      type: String,
      // ref: "App",
      required: true,
    },
    PageId: {
      type: [String],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isCompany: {
      type: Boolean,
      default: false,
    },
    ContactNumber: {
      type: String,
    },
    App: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "App",
      required: true,
    },
    selectedPage: {
      name: {
        type: String,
      },
      id: {
        type: String,
      },
    },
    Otp: {
      type: Number,
    },
    whatsAppMarketing: {
      type: Boolean,
      default: false,
    },
    InteraktToken: {
      type: String,
    },
    Template: {
      NOT_PICKUP: {
        firstMessage: {
          type: String,
        },
        7: {
          type: String,
        },
        30: {
          type: String,
        },
      },
      QUALIFIED: {
        firstMessage: {
          type: String,
        },
        45: {
          type: String,
        },
        90: {
          type: String,
        },
        180: {
          type: String,
        },
      },
      HOT_LEADS: {
        firstMessage: {
          type: String,
        },
        2: {
          type: String,
        },
        6: {
          type: String,
        },
        30: {
          type: String,
        },
      },
      CONVERSION_LEADS: {
        firstMessage: { type: String }, // thankyou message
        3: {
          type: String, // Feedback message
        },
        7: {
          type: String, // Consumption message
        },
      },
      welComeMessage: { type: String },
    },
    CustomData: {
      type: [Object],
      default: [],
    },
    CustomKey: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
