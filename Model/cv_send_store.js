const { Schema, model } = require("mongoose");

const cvsendSchema = Schema(
  {
    userid: {
        type: "ObjectId",
        ref: "User"
    },
    recruiterid: {
        type: "ObjectId",
        ref: "Recruiters_profile"
    },
    recruiter_job_postid: {
        type: "ObjectId",
        ref: "job_post"
    }
  },
  { timestamps: true }
);


var CvSendStore = model("Cvsendstore", cvsendSchema);

module.exports = CvSendStore;
