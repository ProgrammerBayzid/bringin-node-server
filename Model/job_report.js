const { Schema, model } = require("mongoose");

const jobreportSchema = Schema(
  {
    userid: "ObjectId",
    // userid: {
    //   type: "ObjectID",
    //   ref: "user",
    // },

    report: [
      {
        type: String,
      },
    ],
    image: String,
    jobid: {
      type: "ObjectId",
      ref: "job_post",
    },
    jobpostuserid: {
      type: "ObjectId",
      ref: "Recruiters_profile"
    },
    description: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

var JobReport = model("job_report", jobreportSchema);

module.exports = JobReport;
