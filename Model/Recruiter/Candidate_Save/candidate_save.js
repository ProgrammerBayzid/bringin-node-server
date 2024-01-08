const { Schema, model } = require("mongoose");

const candidateSaveSchema = Schema(
  {
    userid: {
      type: "ObjectId",
      ref: "Recruiters_profile",
    },
    candidateid: "ObjectId",
    candidatefullprofile: {
      type: "ObjectId",
      ref: "seeker_profiledata",
    },
  },
  { timestamps: true }
);

var SandidateSave = model("Candidate_Save", candidateSaveSchema);

module.exports = SandidateSave;
