const { Schema, model } = require("mongoose");

const packageSchema = Schema(
  {
    name: String,
    suggestname: String,
    chat: Number,
    amount: Number,
    currency: {
      type: String,
      default: "BDT",
    },
    duration_time: Number,
  },
  { timestamps: true }
);

var Package = model("Packages", packageSchema);

module.exports = Package;
