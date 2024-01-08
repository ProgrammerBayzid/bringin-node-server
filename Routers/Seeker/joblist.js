const express = require("express");
const app = express();
const tokenverify = require("../../MiddleWare/tokenverify.js");
const jwt = require("jsonwebtoken");
const {
  Company,
  Companysize,
} = require("../../Model/Recruiter/Company/company.js");
const JobPost = require("../../Model/Recruiter/Job_Post/job_post.js");
const multer = require("multer");
const Career_preferences = require("../../Model/career_preferences.js");
const JobSave = require("../../Model/jobsave.js");
const JobReport = require("../../Model/job_report.js");
const { EducationLavel } = require("../../Model/education_lavel.js");
const { Salirietype } = require("../../Model/salarie");
const Experince = require("../../Model/experience.js");
const { Expertisearea2, Category2 } = require("../../Model/industry");
const ViewJob = require("../../Model/viewjob");
const Seekeruser = require("../../Model/userModel.js");
const { Chat, Message } = require("../../Model/Chat/chat");
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

app.get("/seeker_expertise", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;
    var carear = await Career_preferences.find({ userid: _id })
      .populate(["functionalarea"])
      .select("functionalarea");
    res.status(200).send(carear);
  } catch (error) {
    res.status(400).send(error);
  }
});

// job list
function salaryfilter(filter, careardata) {
  return careardata.filter((data) => {
    if (
      data.salaray.min_salary.type == 1 &&
      data.salaray.max_salary.type == 1
    ) {
      if (
        data.salaray.min_salary.salary <= filter.salary.min_salary.salary &&
        filter.salary.max_salary.salary <= data.salaray.max_salary.salary
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      if (
        data.salaray.min_salary.type == filter.salary.min_salary.type &&
        data.salaray.max_salary.type == filter.salary.max_salary.type
      ) {
        return true;
      } else {
        return false;
      }
    }
  });
}

function locationfiltertt(filter, careardata) {
  return careardata.filter((data) => {
    console.log("Data:", data);

    const cityName = data.division?.cityid?.name?.toLowerCase() ?? "";
    const formetAddress =
      filter.job_location?.formet_address?.toLowerCase() ?? "";

    if (
      (cityName && formetAddress && new RegExp(cityName).test(formetAddress)) ||
      new RegExp(data.division?.divisionname?.toLowerCase()).test(formetAddress)
    ) {
      return true;
    } else {
      return false;
    }
  });
}

app.get("/job_search", tokenverify, async (req, res) => {
  try {
    const _id = req.userId;
    var term = new RegExp(req.query.city, "i");

    query = [
      { job_title: { $regex: req.query.search, $options: "i" } },
      { companyname: { $regex: req.query.search, $options: "i" } },
      // { "job_location.formet_address": { $regex: term } },
      // { "job_location.city": { $regex: term } },
    ];

    //check if req.query.city is not empty string or null
    if (req.query.city) {
      query.push(
        {
          "job_location.formet_address": {
            $regex: req.query.city,
            $options: "i",
          },
        },
        { "job_location.city": { $regex: req.query.city, $options: "i" } }
      );
    }

    var company = await JobPost.find({
      $or: query,
    })
      .populate([
        { path: "userid" },
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
      ])
      .limit(20)
      .then((data) =>
        data.filter(
          (filterdata) => filterdata.userid.other.profile_verify == true
        )
      );
    res.status(200).send(company);
    // req.query.city ??
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

app.post("/job_save", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;
    var jobdata = await JobPost.findOne({ _id: req.body.jobid });
    var data = await JobSave.findOne({
      userid: _id,
      jobid: req.body.jobid,
    });
    if (data == null) {
      await JobSave({
        userid: _id,
        jobid: req.body.jobid,
        jobpostuserid: jobdata.userid,
      }).save();
      await Seekeruser.findOneAndUpdate(
        { _id: _id },
        { $inc: { "other.savejob": 1 } }
      );
      res.status(200).json({ message: "Job saved successfully" });
    } else {
      await JobSave.findOneAndDelete({ _id: data._id });
      await Seekeruser.findOneAndUpdate(
        { _id: _id },
        { $inc: { "other.savejob": -1 } }
      );
      res.status(200).json({ message: "Job unsaved successfully" });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/job_save", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;

    var data = await JobSave.find({ userid: _id })
      .select("jobid")
      .populate({
        path: "jobid",
        populate: [
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
        ],
      })
      .sort({ createdAt: -1 });
    if (data == null) {
      res.status(400).json({ message: "Save Job Not Found" });
    } else {
      res.status(200).send(data);
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post(
  "/job_report",
  tokenverify,
  upload.single("image"),
  async (req, res) => {
    try {
      const token = req.token;
      const _id = req.userId;
      var reportdata = await JobReport.findOne({
        userid: _id,
        jobid: req.body.jobid,
      });
      if (reportdata == null) {
        await JobReport({
          userid: _id,
          jobid: req.body.jobid,
          report: req.body.report,
          image: req.file == null ? "" : req.file.path,
          description: req.body.description,
          jobpostuserid: req.body.jobpostuserid,
        }).save();
        res.status(200).json({ message: "report successfull" });
      } else {
        await JobReport.findOneAndUpdate(
          { userid: _id, jobid: req.body.jobid },
          {
            $set: {
              report: req.body.report,
              image: req.file == null ? "" : req.file.path,
              description: req.body.description,
            },
          }
        );
        res.status(200).json({ message: "you job report update" });
      }
    } catch (error) {
      res.status(400).send(error);
    }
  }
);

app.get("/job_filter", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;

    let alleducation = [];
    var education = await EducationLavel.find().select("name");
    education.forEach((e) => {
      alleducation.push(e._id);
    });
    let allsalary = [];
    var salaray = await Salirietype.find(
      {},
      { other_salary: { $slice: 1 } }
    ).populate([{ path: "other_salary", select: "-other_salary" }]);
    salaray.forEach((e) =>
      allsalary.push({
        min_salary: e._id,
        max_salary: e.other_salary.length > 0 ? e.other_salary[0]._id : e._id,
      })
    );
    let allexperience = [];
    var experience = await Experince.find();
    experience.forEach((e) => {
      allexperience.push(e._id);
    });
    let allindustry = [];
    var industry = await Category2.find().limit(18);
    industry.forEach((e) => allindustry.push(e._id));
    let allcompanysize = [];
    var companysize = await Companysize.find();
    companysize.forEach((e) => allcompanysize.push(e._id));
    let requreeducation = {
      allworkplace: [true, false],
      workplace: [
        {
          name: "Remote",
          value: true,
        },
        {
          name: "On-Site",
          value: false,
        },
      ],
      alleducation: alleducation,
      education: education,
      allsalary: allsalary,
      salary: salaray,
      allexperience: allexperience,
      experience: experience,
      allindustry: allindustry,
      industry: industry,
      allcompanysize: allcompanysize,
      companysize: companysize,
    };
    res.status(200).json(requreeducation);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post("/job_filter", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;

    var workplace = req.body.workplace;
    var education = req.body.education;
    var salary = req.body.salary;
    var experience = req.body.experience;
    var industry = req.body.industry;
    var companysize = req.body.companysize;

    var minsalary = [];
    var maxsalary = [];
    for (let index = 0; index < req.body.salary.length; index++) {
      minsalary.push(req.body.salary[index].min_salary);
      maxsalary.push(req.body.salary[index].max_salary);
    }

    var populate = [
      { path: "userid" },
      { path: "expertice_area" },
      {
        path: "job_location.divisiondata",
        populate: { path: "cityid", select: "name" },
      },
      { path: "experience", match: { _id: { $in: experience } } },
      {
        path: "education",
        match: { _id: { $in: education } },
        select: "-digree",
      },
      {
        path: "company",
        populate: [
          { path: "c_size", match: { _id: { $in: companysize } } },
          {
            path: "industry",
            match: { _id: { $in: industry } },
            select: "-category",
          },
          {
            path: "c_location.divisiondata",
            populate: { path: "cityid", select: "name" },
          },
        ],
      },
      {
        path: "salary.min_salary",
        select: "-other_salary",
        match: { _id: { $in: minsalary } },
      },
      {
        path: "salary.max_salary",
        select: "-other_salary",
        match: { _id: { $in: maxsalary } },
      },
      { path: "jobtype" },
    ];
    var joblist = await JobPost.find({
      expertice_area: req.body.functionalareaid,
      remote: { $in: workplace },
    })
      .populate(populate)
      .then((data) =>
        data.filter(
          (filterdata) =>
            filterdata.expertice_area != null &&
            filterdata.experience != null &&
            filterdata.education != null &&
            filterdata.company.c_size != null &&
            filterdata.company.industry != null &&
            filterdata.salary.min_salary != null &&
            filterdata.salary.max_salary != null
        )
      );

    res.status(200).json(joblist);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post("/view_job_count", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;
    var viewjobdata = await ViewJob.findOne({
      jobid: req.body.jobid,
      userid: _id,
    });
    if (viewjobdata == null) {
      await ViewJob({
        jobid: req.body.jobid,
        userid: _id,
        jobpost_userid: req.body.jobpost_userid,
      }).save();
      await Seekeruser.findOneAndUpdate(
        { _id: _id },
        { $inc: { "other.viewjob": 1 } }
      );
      var chatchannel = await Chat.findOneAndUpdate(
        {
          recruiterid: req.body.jobpost_userid,
          "who_view_me.title": "Who viewed me",
        },
        {
          $set: { "who_view_me.recruiterview": _id },
          $inc: { "who_view_me.totalview": 1, "who_view_me.newview": 1 },
        }
      );
      if (chatchannel == null) {
        await Chat({
          type: 3,
          recruiterid: req.body.jobpost_userid,
          seekerid: null,
          who_view_me: {
            title: "Who viewed me",
            totalview: 1,
            newview: 1,
            recruiterview: _id,
            seekerviewid: null,
          },
        }).save();
      }
    }
    res.status(200).json({ message: "Successfully view" });
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/view_job_history", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;
    let joblist = [];
    var populate = [
      { path: "userid" },
      { path: "expertice_area" },
      { path: "experience" },
      { path: "education", select: "-digree" },
      {
        path: "job_location.divisiondata",
        populate: { path: "cityid", select: "name" },
      },
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
      { path: "salary.min_salary", select: "-other_salary" },
      { path: "salary.max_salary", select: "-other_salary" },
      { path: "skill" },
      { path: "jobtype" },
    ];
    var viewjobdata = await ViewJob.find({ userid: _id })
      .populate({
        path: "jobid",
        populate: populate,
      })
      .sort({ createdAt: -1 });
    for (let index = 0; index < viewjobdata.length; index++) {
      joblist.push(viewjobdata[index].jobid);
    }
    res.status(200).send(joblist);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/functional_jobfilter", tokenverify, async (req, res) => {
  const token = req.token;
  const _id = req.userId;
  var joblist;
  var populate = [
    { path: "userid" },
    { path: "expertice_area" },
    { path: "experience" },
    {
      path: "job_location.divisiondata",
      populate: { path: "cityid", select: "name" },
    },
    { path: "education", select: "-digree" },
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
    { path: "salary.min_salary", select: "-other_salary" },
    { path: "salary.max_salary", select: "-other_salary" },
    { path: "jobtype" },
  ];
  var term = new RegExp(req.query.division, "i");
  if (req.query.type == "0") {
    joblist = await JobPost.find({
      expertice_area: req.query.functionalarea,
      "job_location.formet_address": { $regex: term },
    }).populate(populate);
  } else if (req.query.type == "1") {
    joblist = await JobPost.find({
      expertice_area: req.query.functionalarea,
    })
      .sort({ _id: -1 })
      .limit(10)
      .populate(populate);
  } else if (req.query.type == "2") {
    joblist = await JobPost.find({
      expertice_area: req.query.functionalarea,
      "job_location.divisiondata": req.query.divisionid,
    }).populate(populate);
  }

  res.status(200).send(joblist);
});

app.get("/seeker_joblist", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;

    var Carearpreferancepopulate = [
      { path: "category", select: "-functionarea" },
      "functionalarea",
      {
        path: "division",
        populate: { path: "cityid", select: "-divisionid" },
      },
      "jobtype",
      { path: "salaray.min_salary", select: "-other_salary" },
      { path: "salaray.max_salary", select: "-other_salary" },
    ];
    var populate = [
      { path: "userid" },
      { path: "expertice_area" },
      { path: "experience" },
      {
        path: "job_location.divisiondata",
        populate: { path: "cityid", select: "name" },
      },
      { path: "education", select: "-digree" },
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
      { path: "salary.min_salary", select: "-other_salary" },
      { path: "salary.max_salary", select: "-other_salary" },
      { path: "jobtype" },
    ];
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10000;
    const skip = (page - 1) * limit;
    var careardata = await Career_preferences.find({
      userid: _id,
    }).populate(Carearpreferancepopulate);
    const careardataID = careardata.map(
      (careardataSingleID) => careardataSingleID.division?.cityid?._id
    );
    console.log("canDevision", careardataID);

    if (req.query.functionalarea == 0) {
      if (
        !req.query.candidateDivisionId ||
        req.query.candidateDivisionId === "0" ||
        req.query.candidateDivisionId === 0
      ) {
        const profileVerifyPipeline = [
          {
            $lookup: {
              from: "recruiters_profiles",
              localField: "userid",
              foreignField: "_id",
              as: "userData",
            },
          },
          {
            $unwind: "$userData", // Unwind the userData array if it exists
          },
          {
            $match: {
              "userData.other.profile_verify": true,
            },
          },
        ];
        const profileVerifyPipelineJobPost = await JobPost.aggregate(
          profileVerifyPipeline
        );

        const profileVerifyPipelineJobPostID = profileVerifyPipelineJobPost.map(
          (profileVerifyPipelineJobPostSingleID) =>
            profileVerifyPipelineJobPostSingleID._id
        );

        var profileVerifyJobPosts = await JobPost.find({
          _id: { $in: profileVerifyPipelineJobPostID },
          job_status: "Open",
        })
          .populate(populate)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);
        res.status(200).send(profileVerifyJobPosts);
      } else if (
        req.query.candidateDivisionId === "1" ||
        req.query.candidateDivisionId === 1
      ) {
        const combinedDivisionAndProfileVerifyPipeline = [
          {
            $lookup: {
              from: "recruiters_profiles",
              localField: "userid",
              foreignField: "_id",
              as: "userData",
            },
          },
          {
            $unwind: "$userData",
          },
          {
            $lookup: {
              from: "divisions",
              localField: "job_location.divisiondata",
              foreignField: "_id",
              as: "division",
            },
          },
          {
            $lookup: {
              from: "cities",
              localField: "division.cityid",
              foreignField: "_id",
              as: "city",
            },
          },
          {
            $match: {
              $and: [
                {
                  "userData.other.profile_verify": true,
                },
                {
                  "city._id": {
                    $in: careardataID,
                  },
                },
              ],
            },
          },
        ];
        const profileVerifyAndDivisionPipelineJobPost = await JobPost.aggregate(
          combinedDivisionAndProfileVerifyPipeline
        );
        console.log(
          "profileVerifyAndDivisionPipelineJobPost",
          profileVerifyAndDivisionPipelineJobPost
        );

        const profileVerifyAndDivisionPipelineJobPostID =
          profileVerifyAndDivisionPipelineJobPost.map(
            (profileVerifyAndDivisionPipelineJobPostSingleID) =>
              profileVerifyAndDivisionPipelineJobPostSingleID._id
          );
        var profileVerifyAndDivisionJobPosts = await JobPost.find({
          _id: { $in: profileVerifyAndDivisionPipelineJobPostID },
          job_status: "Open",
        })
          .populate(populate)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);
        res.status(200).send(profileVerifyAndDivisionJobPosts);
      }
    } else {
      if (
        !req.query.candidateDivisionId ||
        req.query.candidateDivisionId === "0" ||
        req.query.candidateDivisionId === 0
      ) {
        const expertichAreaProfileVerifyPipeline = [
          {
            $lookup: {
              from: "recruiters_profiles",
              localField: "userid",
              foreignField: "_id",
              as: "userData",
            },
          },
          {
            $unwind: "$userData", // Unwind the userData array if it exists
          },
          {
            $match: {
              "userData.other.profile_verify": true,
            },
          },
        ];
        const expertice_areaProfileVerifyPipelineJobPost =
          await JobPost.aggregate(expertichAreaProfileVerifyPipeline);

        const expertice_areaProfileVerifyPipelineJobPostID =
          expertice_areaProfileVerifyPipelineJobPost.map(
            (expertice_areaProfileVerifyPipelineJobPostSingleID) =>
              expertice_areaProfileVerifyPipelineJobPostSingleID._id
          );

        var expertice_areaProfileVerifyJobPosts = await JobPost.find({
          _id: { $in: expertice_areaProfileVerifyPipelineJobPostID },
          expertice_area: req.query.functionalarea,
          job_status: "Open",
        })
          .populate(populate)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);
        res.status(200).send(expertice_areaProfileVerifyJobPosts);
      } else if (
        req.query.candidateDivisionId === "1" ||
        req.query.candidateDivisionId === 1
      ) {
        const expertichAreaCombinedDivisionAndProfileVerifyPipeline = [
          {
            $lookup: {
              from: "recruiters_profiles",
              localField: "userid",
              foreignField: "_id",
              as: "userData",
            },
          },
          {
            $unwind: "$userData", // Unwind the userData array if it exists
          },
          {
            $lookup: {
              from: "divisions",
              localField: "job_location.divisiondata",
              foreignField: "_id",
              as: "division",
            },
          },
          {
            $lookup: {
              from: "cities",
              localField: "division.cityid",
              foreignField: "_id",
              as: "city",
            },
          },
          {
            $match: {
              $and: [
                {
                  "userData.other.profile_verify": true,
                },
                {
                  "city._id": {
                    $in: careardataID,
                  },
                },
              ],
            },
          },
        ];
        const experticeAreaProfileVerifyAndDivisionPipelineJobPost =
          await JobPost.aggregate(
            expertichAreaCombinedDivisionAndProfileVerifyPipeline
          );

        const experticeAreaProfileVerifyAndDivisionPipelineJobPostID =
          experticeAreaProfileVerifyAndDivisionPipelineJobPost.map(
            (experticeAreaProfileVerifyAndDivisionPipelineJobPostSingleID) =>
              experticeAreaProfileVerifyAndDivisionPipelineJobPostSingleID._id
          );

        var expertice_areaAndDivisionMatch = await JobPost.find({
          _id: { $in: experticeAreaProfileVerifyAndDivisionPipelineJobPostID },
          expertice_area: req.query.functionalarea,
          job_status: "Open",
        })
          .populate(populate)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);
        res.status(200).send(expertice_areaAndDivisionMatch);
      }
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = app;
