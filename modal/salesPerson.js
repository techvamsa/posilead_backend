const mongoose = require("mongoose");

const SalesPersonSchema = new mongoose.Schema({
   Name: {
      type: String,
      required: true
   },
   Email: {
      type: String,
      unique:true,
      required:true
   },
   Number: {
      type: Number,
      required:true
   },
   Password: {
      type: String,
      required: true
   },
   Activity: {
      type: Boolean,
      default:true
   },
   User: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
   },
   Service:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Services",
      required: true
   },
   CustomData: {
      type: [Object],
      default:[]
    },


}, { timestamps: true })


module.exports = mongoose.model("SalesPerson", SalesPersonSchema)