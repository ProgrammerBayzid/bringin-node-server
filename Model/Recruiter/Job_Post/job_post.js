const { Schema, model } = require("mongoose");

const jobpostSchema = Schema(
  {
    userid: {
      type: "ObjectId",
      ref: "Recruiters_profile",
    },
    richText: {
      type: Boolean,
      default: false,
    },
    job_title: String,
    job_hidden: {
      type: Boolean,
      default: false,
    },
    companyname: {
      type: String,
      default: null,
    },
    expertice_area: {
      type: "ObjectId",
      ref: "FunctionalArea",
    },
    job_description: String,
    experience: {
      type: "ObjectId",
      ref: "Experience",
    },
    education: {
      type: "ObjectId",
      ref: "Education_Lavel",
    },
    salary: {
      min_salary: {
        type: "ObjectId",
        ref: "Salary",
      },
      max_salary: {
        type: "ObjectId",
        ref: "Salary",
      },
    },
    company: {
      type: "ObjectId",
      ref: "Company",
    },
    skill: [
      {
        type: String,
      },
    ],
    jobtype: {
      type: "ObjectId",
      ref: "Jobtype",
    },
    job_location: {
      lat: Schema.Types.Mixed,
      lon: Schema.Types.Mixed,
      formet_address: String,
      locationoptional: String,
      divisiondata: {
        type: "ObjectId",
        ref: "Division",
        default: "64aa36d31932a2e4a09a79ed",
      },
    },
    remote: Boolean,
    job_status_type: Number,
    job_status: String,
    postdate: Date,
  },
  { timestamps: true }
);

var JobPost = model("job_post", jobpostSchema);

module.exports = JobPost;
