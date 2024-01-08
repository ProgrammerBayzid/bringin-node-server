const { Schema, model } = require("mongoose");

const chatstoreSchema = Schema(
  {
    seekerid: {
      type: "ObjectId",
      ref: "User",
    },
    recruiterid: {
      type: "ObjectId",
      ref: "Recruiters_profile",
    },
    jobid: {
      type: "ObjectId",
      default: null,
      ref: "job_post",
    },
    candidate_fullprofile: {
      type: "ObjectId",
      default: null,
      ref: "seeker_profiledata",
    },
  },
  { timestamps: true }
);

var ChatStore = model("Chat_Store", chatstoreSchema);

module.exports = ChatStore;
