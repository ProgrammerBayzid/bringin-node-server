const { Schema, model } = require("mongoose");

const viewCandidatesSchema = Schema(
  {
    recruterID: {
      type: "ObjectId",
      ref: "Recruiters_profile",
    },
    seekerID: {
      type: "ObjectId",
      ref: "User",
    },
  },
  { timestamps: true }
);
var viewCandidates = model("view_Candidates", viewCandidatesSchema);

module.exports = viewCandidates;
