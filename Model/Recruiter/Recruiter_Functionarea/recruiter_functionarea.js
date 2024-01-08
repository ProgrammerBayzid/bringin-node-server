const { Schema, model } = require("mongoose");

const recruiterexperticeSchema = Schema(
  {
    userid: {
      type: "ObjectId",
      ref: "Recruiters_profile",
    },
    jobid: "ObjectId",
    expertice_area: {
      type: "ObjectId",
      ref: "FunctionalArea",
    },
  },
  { timestamps: true }
);

var Recruiter_Expartice = model(
  "recruiter_functionalarea",
  recruiterexperticeSchema
);

module.exports = Recruiter_Expartice;
