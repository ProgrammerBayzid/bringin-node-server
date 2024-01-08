const { Schema, model } = require("mongoose");

const jobtypeSchema = Schema(
  {
    worktype: String,
    sortOrder: Number,
  },
  { timestamps: true }
);

module.exports.Jobtype = model("Jobtype", jobtypeSchema);
