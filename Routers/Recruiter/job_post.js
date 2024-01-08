const express = require("express");
const { body, validationResult } = require("express-validator");
const app = express();
const tokenverify = require("../../MiddleWare/tokenverify.js");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const Skill = require("../../Model/Recruiter/Skill/skill.js");
const JobPost = require("../../Model/Recruiter/Job_Post/job_post.js");
const JobSave = require("../../Model/jobsave.js");
const RecruiterFunctionarea = require("../../Model/Recruiter/Recruiter_Functionarea/recruiter_functionarea.js");
const { Functionarea } = require("../../Model/industry.js");
const {
  notificaton_send_by_job,
} = require("../../Routers/Notification/notification");
const Recruiters = require("../../Model/Recruiter/recruiters");
const { DefaultSkill } = require("../../Model/Seeker_profile_all_details.js");
const ViewJob = require("../../Model/viewjob");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

app.get("/job_title", tokenverify, async (req, res) => {
  const token = req.token;
  const _id = req.userId;
  var data2 = await Functionarea.find({
    functionalname: { $regex: req.query.search, $options: "i" },
  }).populate([
    { path: "industryid", select: "-category" },
    { path: "categoryid", select: "-functionarea" },
  ]);
  res.status(200).send(data2);
});

app.post(
  "/job_post",
  tokenverify,
  [
    body("job_title").notEmpty().withMessage("Job title is required"),

    body("companyname").notEmpty().withMessage("Company name is required"),

    body("expertice_area").notEmpty().withMessage("Expertise area is required"),

    body("job_description")
      .notEmpty()
      .withMessage("Job description is required"),

    body("experience").notEmpty().withMessage("Experience is required"),

    body("education").notEmpty().withMessage("Education is required"),

    // Validate the salary field
    body("salary.min_salary")
      .notEmpty()
      .withMessage("Minimum salary is required"),
    body("salary.max_salary")
      .notEmpty()
      .withMessage("Maximum salary is required"),

    body("company").notEmpty().withMessage("Company is required"),

    body("skill").isArray().withMessage("Skill must be an array"),

    body("jobtype").notEmpty().withMessage("Job type is required"),
    body("job_location.divisiondata")
      .notEmpty()
      .withMessage("Job location division data is required"),
  ],
  async (req, res) => {
    try {
      const token = req.token;
      const id = req.userId;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      var jobdata = await JobPost({
        userid: id,
        job_title: req.body.job_title,
        companyname: req.body.companyname,
        expertice_area: req.body.expertice_area,
        job_description: req.body.job_description,
        experience: req.body.experience,
        education: req.body.education,
        salary: req.body.salary,
        company: req.body.company,
        skill: req.body.skill,
        jobtype: req.body.jobtype,
        remote: req.body.remote,
        job_location: req.body.job_location,
        job_status_type: 1,
        job_status: "Open",
        postdate: new Date(),
        richText: req.body.richText,
      });
      jobdata.save();
      var functiondata = await RecruiterFunctionarea.findOne({
        userid: id,
        expertice_area: req.body.expertice_area,
      });
      if (functiondata == null) {
        await RecruiterFunctionarea({
          userid: id,
          expertice_area: req.body.expertice_area,
          jobid: jobdata._id,
        }).save();
      }

      Promise.all([
        notificaton_send_by_job(req.body.expertice_area, id, {
          type: 2,
          jobid: jobdata._id,
        }),
      ]);
      await Recruiters.findOneAndUpdate(
        { _id: id },
        {
          $set: { "other.latestjobid": jobdata._id },
          $inc: { "other.totaljob": 1 },
        }
      );
      res.status(200).json({ jobid: jobdata._id });
    } catch (error) {
      res.send(error);
    }
  }
);
app.post(
  "/AdminPanel_job_post/:_id",
  tokenverify,
  [
    body("job_title").notEmpty().withMessage("Job title is required"),

    body("companyname").notEmpty().withMessage("Company name is required"),

    body("expertice_area").notEmpty().withMessage("Expertise area is required"),

    body("job_description")
      .notEmpty()
      .withMessage("Job description is required"),

    body("experience").notEmpty().withMessage("Experience is required"),

    body("education").notEmpty().withMessage("Education is required"),

    // Validate the salary field
    body("salary.min_salary")
      .notEmpty()
      .withMessage("Minimum salary is required"),
    body("salary.max_salary")
      .notEmpty()
      .withMessage("Maximum salary is required"),

    body("company").notEmpty().withMessage("Company is required"),

    body("skill").isArray().withMessage("Skill must be an array"),

    body("jobtype").notEmpty().withMessage("Job type is required"),
    body("job_location.divisiondata")
      .notEmpty()
      .withMessage("Job location division data is required"),
  ],
  async (req, res) => {
    try {
      const token = req.token;
      const id = req.params._id;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      var jobdata = await JobPost({
        userid: id,
        job_title: req.body.job_title,
        companyname: req.body.companyname,
        expertice_area: req.body.expertice_area,
        job_description: req.body.job_description,
        experience: req.body.experience,
        education: req.body.education,
        salary: req.body.salary,
        company: req.body.company,
        skill: req.body.skill,
        jobtype: req.body.jobtype,
        remote: req.body.remote,
        job_location: req.body.job_location,
        job_status_type: 1,
        job_status: "Open",
        postdate: new Date(),
        reachText: req.body.richText,
      });
      jobdata.save();
      var functiondata = await RecruiterFunctionarea.findOne({
        userid: id,
        expertice_area: req.body.expertice_area,
      });
      if (functiondata == null) {
        await RecruiterFunctionarea({
          userid: id,
          expertice_area: req.body.expertice_area,
          jobid: jobdata._id,
        }).save();
      }

      Promise.all([
        notificaton_send_by_job(req.body.expertice_area, id, {
          type: 2,
          jobid: jobdata._id,
        }),
      ]);
      await Recruiters.findOneAndUpdate(
        { _id: id },
        {
          $set: { "other.latestjobid": jobdata._id },
          $inc: { "other.totaljob": 1 },
        }
      );
      res.status(200).json({ jobid: jobdata._id });
    } catch (error) {
      res.send(error);
    }
  }
);

app.get("/job_post", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const id = req.userId;

    var populate = [
      "userid",
      "expertice_area",
      "experience",
      "education",
      {
        path: "job_location.divisiondata",
        populate: { path: "cityid", select: "name" },
      },
      { path: "salary.min_salary", select: "-other_salary" },
      { path: "salary.max_salary", select: "-other_salary" },
      {
        path: "company",
        populate: [
          { path: "c_size" },
          { path: "industry", select: "-category" },
          {
            path: "c_location.divisiondata",
            populate: { path: "cityid", select: "name" },
          },
        ],
      },
      "jobtype",
    ];

    if (req.query.type == 0) {
      var jobpost = await JobPost.find({ userid: id })
        .sort("-updatedAt")
        .populate(populate);
      res.status(200).send(jobpost);
    } else {
      var jobpost = await JobPost.find({
        userid: id,
        job_status_type: req.query.type,
      })
        .sort("-updatedAt")
        .populate(populate);
      res.status(200).send(jobpost);
    }
  } catch (error) {
    res.send(error);
  }
});

app.get("/jobpost2", async (req, res) => {
  var data = await JobPost.find().populate({
    path: "job_location.divisiondata",
    populate: { path: "cityid", select: "name" },
  });
  res.status(200).send(data);
});

app.post("/job_post_update", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const id = req.userId;
    if (req.query.jobid) {
      await JobPost.findOneAndUpdate(
        { _id: req.query.jobid },
        {
          $set: {
            userid: id,
            job_title: req.body.job_title,
            companyname: req.body.companyname,
            expertice_area: req.body.expertice_area,
            job_description: req.body.job_description,
            experience: req.body.experience,
            education: req.body.education,
            salary: req.body.salary,
            company: req.body.company,
            skill: req.body.skill,
            jobtype: req.body.jobtype,
            remote: req.body.remote,
            job_location: req.body.job_location,
            job_status_type: req.body.job_status_type ?? 1,
            job_status: req.body.job_status_type == 2 ? "Close" : "Open",
            postdate: new Date(),
          },
        }
      );
      await RecruiterFunctionarea.findOneAndUpdate(
        { userid: id, jobid: req.query.jobid },
        { $set: { expertice_area: req.body.expertice_area } }
      );

      res.status(200).json({ message: "Job Updated successfully" });
    }
  } catch (error) {
    res.send(error);
  }
});

app.delete("/job_post_update", tokenverify, async (req, res) => {
  const token = req.token;
  const id = req.userId;
  if (req.query.jobid) {
    await JobPost.findOneAndDelete({ _id: req.query.jobid, userid: id });
    await RecruiterFunctionarea.deleteMany({
      userid: id,
      jobid: req.query.jobid,
    });
    await ViewJob.deleteMany({ jobid: req.query.jobid });
    await JobSave.deleteMany({ jobid: req.query.jobid });
    await Recruiters.findOneAndUpdate(
      { _id: id },
      {
        $inc: { "other.totaljob": -1 },
      }
    );
    res.status(200).json({ message: "Delete Successfull" });
  }
});

app.get("/single_jobdetails", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;
    var populate = [
      "userid",
      "expertice_area",
      "experience",
      "education",
      {
        path: "job_location.divisiondata",
        populate: { path: "cityid", select: "name" },
      },
      { path: "salary.min_salary", select: "-other_salary" },
      { path: "salary.max_salary", select: "-other_salary" },
      {
        path: "company",

        populate: [
          { path: "c_size" },
          { path: "industry", select: "-category" },
          {
            path: "c_location.divisiondata",
            populate: { path: "cityid", select: "name" },
          },
        ],
      },
      "jobtype",
    ];
    var company = await JobPost.findOne({ _id: req.query.jobid }).populate(
      populate
    );
    res.status(200).send(company);
  } catch (error) {
    res.status(400).send(error);
  }
});

const maskEmail = (email = "") => {
  const [name, domain] = email.split("@");
  const { length: len } = name;
  const maskedName = name[0] + "..." + name[len - 1];
  const maskedEmail = maskedName + "@" + domain;
  return maskedEmail;
};

app.post("/email", async (req, res) => {
  var data = maskEmail(req.body.string);
  res.status(200).send(data);
});

module.exports = app;

// 0 = pending
// 1 = open
// 2 = close
// 3 = reject
