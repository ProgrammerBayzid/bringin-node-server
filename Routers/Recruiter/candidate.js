const express = require("express");
const app = express();
const Recruiters = require("../../Model/Recruiter/recruiters");
const tokenverify = require("../../MiddleWare/tokenverify.js");
const jwt = require("jsonwebtoken");
const RecruiterFunctionarea = require("../../Model/Recruiter/Recruiter_Functionarea/recruiter_functionarea.js");
const multer = require("multer");
const JobPost = require("../../Model/Recruiter/Job_Post/job_post.js");
const candidatesave = require("../../Model/Recruiter/Candidate_Save/candidate_save");
const candidateReport = require("../../Model/Recruiter/Candidate_Report/candidate_report");
const { Profiledata } = require("../../Model/Seeker_profile_all_details.js");
const candidateview = require("../../Model/Recruiter/Candidate_View/candidate_view");
const { Chat, Message } = require("../../Model/Chat/chat");
const {
  notifySendWhenRecruterViewProfile,
} = require("../Notification/notification");
const { ObjectId } = require("mongoose").Types;

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

app.get("/candidate_functionalarea", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;
    var candidate_function = await RecruiterFunctionarea.find({
      userid: _id,
    })
      .sort("-updatedAt")
      .limit(10)
      .select("expertice_area")
      .populate({ path: "expertice_area", select: "functionalname" });
    res.status(200).send(candidate_function);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post("/add_candidate_functional", tokenverify, async (req, res) => {
  try {
    const _id = req.userId;
    var candidate_function = await RecruiterFunctionarea.findOneAndUpdate(
      { userid: _id, expertice_area: req.body.expertice_area },
      {
        $set: {
          expertice_area: req.body.expertice_area,
        },
      }
    );
    if (candidate_function == null) {
      await RecruiterFunctionarea({
        userid: _id,
        expertice_area: req.body.expertice_area,
      }).save();
      res.status(200).json({ message: "Functional Area add successfully" });
    } else {
      res.status(200).json({ message: "Functional Area Updated" });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/candidatelist", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100000; // Default limit to 10 if not provided
    const page = parseInt(req.query.page) || 1; // Default page to 1 if not provided

    var populate1 = [
      {
        path: "workexperience",
        populate: [
          { path: "category", select: "-functionarea" },
          "expertisearea",
        ],
      },
      {
        path: "education",
        populate: [
          {
            path: "digree",
            select: "-subject",
            populate: { path: "education", select: "-digree" },
          },
          "subject",
        ],
      },
      "protfoliolink",
      "about",
      {
        path: "careerPreference",
        populate: [
          {
            path: "category",
            select: "-functionarea",
            populate: [{ path: "industryid" }],
          },
          {
            path: "functionalarea",
            populate: [{ path: "industryid", select: "-category" }],
          },
          {
            path: "division",
            populate: { path: "cityid", select: "-divisionid" },
          },
          "jobtype",
          { path: "salaray.min_salary", select: "-other_salary" },
          { path: "salaray.max_salary", select: "-other_salary" },
        ],
      },
      { path: "userid", populate: { path: "experiencedlevel" } },
    ];

    if (
      req.query.functionalareaid === "0" ||
      req.query.functionalareaid === 0
    ) {
      if (
        !req.query.recruitersDivisionId ||
        req.query.recruitersDivisionId === "0" ||
        req.query.recruitersDivisionId === 0
      ) {
        // Get All candidates
        const allCandidates = await Profiledata.find()
          .populate(populate1)
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip((page - 1) * limit);
        res.status(200).send(allCandidates);
      } else {
        // pipelines using for division

        var divisionPipeline = [
          {
            $lookup: {
              from: "career_preferences",
              localField: "careerPreference",
              foreignField: "_id",
              as: "careerPreference",
            },
          },
          {
            $lookup: {
              from: "divisions",
              localField: "careerPreference.division",
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
              "city._id": {
                $in: [new ObjectId(req.query.recruitersDivisionId)],
              },
            },
          },
        ];
        // for get candidate with division
        const divisionSeekerdatas = await Profiledata.aggregate(
          divisionPipeline
        );
        const divisionSeekerId = divisionSeekerdatas.map(
          (divisionSeekerdata) => divisionSeekerdata._id
        );
        const divisionPopuletedSeekerdatas = await Profiledata.find({
          _id: { $in: divisionSeekerId },
        })
          .populate(populate1)
          .sort({ createdAt: -1 });
        res
          .status(200)
          .send(divisionPopuletedSeekerdatas)
          .limit(limit)
          .skip((page - 1) * limit);
      }
    } else {
      if (
        !req.query.recruitersDivisionId ||
        req.query.recruitersDivisionId === "0" ||
        req.query.recruitersDivisionId === 0
      ) {
        // pipelines using for funtionalArea
        var functionalareaPipeline = [
          {
            $lookup: {
              from: "career_preferences",
              localField: "careerPreference",
              foreignField: "_id",
              as: "careerPreference",
            },
          },
          {
            $lookup: {
              from: "functionalareas",
              localField: "careerPreference.functionalarea",
              foreignField: "_id",
              as: "functionalArea",
            },
          },
          {
            $match: {
              "functionalArea._id": {
                $in: [new ObjectId(req.query.functionalareaid)],
              },
            },
          },
        ];
        // for get candidate with functionalarea
        const functionalareaSeekerdatas = await Profiledata.aggregate(
          functionalareaPipeline
        );
        const functionalareaSeekerId = functionalareaSeekerdatas.map(
          (funtionalAreaSeekerdata) => funtionalAreaSeekerdata._id
        );
        const functionalareaPopuletedSeekerdatas = await Profiledata.find({
          _id: { $in: functionalareaSeekerId },
        })
          .populate(populate1)
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip((page - 1) * limit);
        res.status(200).send(functionalareaPopuletedSeekerdatas);
      } else {
        // Combine both pipelines using $and in $match stage
        const combinedPipeline = [
          {
            $lookup: {
              from: "career_preferences",
              localField: "careerPreference",
              foreignField: "_id",
              as: "careerPreference",
            },
          },
          {
            $lookup: {
              from: "functionalareas",
              localField: "careerPreference.functionalarea",
              foreignField: "_id",
              as: "functionalArea",
            },
          },
          {
            $lookup: {
              from: "divisions",
              localField: "careerPreference.division",
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
                  "functionalArea._id": {
                    $in: [new ObjectId(req.query.functionalareaid)],
                  },
                },
                {
                  "city._id": {
                    $in: [new ObjectId(req.query.recruitersDivisionId)],
                  },
                },
              ],
            },
          },
        ];
        // for get candidate with functionalarea and division
        const bothDivisionAndFuntionalAreaSeekerdatas =
          await Profiledata.aggregate(combinedPipeline);
        console.log(
          "bothDivisionAndFuntionalAreaSeekerdatas",
          bothDivisionAndFuntionalAreaSeekerdatas
        );
        const bothDivisionAndFuntionalAreaSeekerId =
          bothDivisionAndFuntionalAreaSeekerdatas.map(
            (bothDivisionAndFuntionalAreaSeekerdata) =>
              bothDivisionAndFuntionalAreaSeekerdata._id
          );
        const bothDivisionAndFuntionalAreaPopuletedSeekerdatas =
          await Profiledata.find({
            _id: { $in: bothDivisionAndFuntionalAreaSeekerId },
          })
            .populate(populate1)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit);
        res.status(200).send(bothDivisionAndFuntionalAreaPopuletedSeekerdatas);
      }
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(400).send(error);
  }
});

app.post("/candidate_save", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;
    var data = await candidatesave.findOne({
      userid: _id,
      candidatefullprofile: req.body.candidatefullprofile,
    });
    if (data == null) {
      await candidatesave({
        userid: _id,
        candidateid: req.body.candidateid,
        candidatefullprofile: req.body.candidatefullprofile,
      }).save();
      await Recruiters.findOneAndUpdate(
        { _id: _id },
        { $inc: { "other.savecandidate": 1 } }
      );
      res.status(200).json({ message: "Candidate saved successfully" });
    } else {
      await candidatesave.findOneAndDelete({ _id: data._id });
      await Recruiters.findOneAndUpdate(
        { _id: _id },
        { $inc: { "other.savecandidate": -1 } }
      );
      res.status(200).json({ message: "Candidate unsaved successfully" });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/candidate_save", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;

    var data = await candidatesave.find({ userid: _id }).populate({
      path: "candidatefullprofile",
      populate: [
        {
          path: "workexperience",
          populate: [
            { path: "category", select: "-functionarea" },
            "expertisearea",
          ],
        },
        {
          path: "education",
          populate: [
            {
              path: "digree",
              select: "-subject",
              populate: { path: "education", select: "-digree" },
            },
            "subject",
          ],
        },
        "protfoliolink",
        "about",
        {
          path: "careerPreference",
          populate: [
            { path: "category", select: "-functionarea" },
            { path: "functionalarea" },
            {
              path: "division",
              populate: { path: "cityid", select: "-divisionid" },
            },
            "jobtype",
            { path: "salaray.min_salary", select: "-other_salary" },
            { path: "salaray.max_salary", select: "-other_salary" },
          ],
        },
        { path: "userid", populate: { path: "experiencedlevel" } },
      ],
    });
    res.status(200).send(data);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post(
  "/candidate_report",
  tokenverify,
  upload.single("image"),
  async (req, res) => {
    try {
      const token = req.token;
      const _id = req.userId;
      var reportdata = await candidateReport.findOne({
        userid: _id,
        candidateid: req.body.candidateid,
      });
      if (reportdata == null) {
        await candidateReport({
          userid: _id,
          candidateid: req.body.candidateid,
          candidatefulldetailsid: req.body.candidatefulldetailsid,
          report: req.body.report,
          image: req.file == null ? "" : req.file.path,
          description: req.body.description,
        }).save();
        res.status(200).json({ message: "Report successfully" });
      } else {
        await candidateReport.findOneAndUpdate(
          { userid: _id, candidateid: req.body.candidateid },
          {
            $set: {
              report: req.body.report,
              image: req.file == null ? "" : req.file.path,
              description: req.body.description,
              candidatefulldetailsid: req.body.candidatefulldetailsid,
            },
          }
        );
        res.status(200).json({ message: "Job report updated successfully" });
      }
    } catch (error) {
      res.status(400).send(error);
    }
  }
);

function locationfilter(locationdata, locationid) {
  if (
    locationdata.division.cityid != null &&
    locationdata.division.cityid._id == locationid
  ) {
    return true;
  } else {
    return false;
  }
}

app.get("/candidate_search", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;
    console.log(req.query.location);
    // var company = await Profiledata.find({job_title: {$regex: req.query.search, $options: "i"} }).populate(["userid",
    //         "expertice_area",
    //         "experience",
    //         "education",
    //         "salary",
    //         { path: "company",match: { "c_location.formet_address": { $regex: req.query.city ?? "", $options: "i" } }, populate: [{ path: "c_size" }, { path: "industry", select: "-category" }] },
    //         "skill",
    //         "jobtype"]).then((data) => data.filter((filterdata) => filterdata.company != null))

    var seekerdata = await Profiledata.find()
      .populate([
        {
          path: "workexperience",
          populate: [
            { path: "category", select: "-functionarea" },
            "expertisearea",
          ],
        },
        {
          path: "education",
          populate: [
            {
              path: "digree",
              select: "-subject",
              populate: { path: "education", select: "-digree" },
            },
            "subject",
          ],
        },
        "protfoliolink",
        "about",
        {
          path: "careerPreference",
          populate: [
            { path: "category", select: "-functionarea" },
            { path: "functionalarea", populate: { path: "industryid" } },
            {
              path: "division",
              populate: {
                path: "cityid",
                select: "-divisionid",
                match: { _id: req.query.location },
              },
            },
            "jobtype",
            { path: "salaray.min_salary", select: "-other_salary" },
            { path: "salaray.max_salary", select: "-other_salary" },
          ],
        },
        {
          path: "userid",
          match: { fastname: { $regex: req.query.name, $options: "i" } },
          populate: { path: "experiencedlevel" },
        },
      ])
      .then((data) =>
        data.filter((filterdata) => {
          var locationdata = filterdata.careerPreference.filter((f) => {
            var l = locationfilter(f, req.query.location);

            return l;
          });
          if (filterdata.userid != null && locationdata.length > 0) {
            return true;
          } else {
            return false;
          }
        })
      );
    res.status(200).send(seekerdata);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post("/candidate_filter", tokenverify, async (req, res) => {
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
      {
        path: "workexperience",
        populate: [
          { path: "category", select: "-functionarea" },
          "expertisearea",
        ],
      },
      {
        path: "education",
        populate: [
          {
            path: "digree",
            select: "-subject",
            populate: { path: "education", select: "-digree" },
          },
          "subject",
        ],
      },
      "protfoliolink",
      "about",
      {
        path: "careerPreference",
        populate: [
          { path: "category", select: "-functionarea" },
          {
            path: "functionalarea",
            populate: [{ path: "industryid", select: "-category" }],
          },
          {
            path: "division",
            populate: { path: "cityid", select: "-divisionid" },
          },
          "jobtype",
          {
            path: "salaray.min_salary",
            select: "-other_salary",
            match: { _id: { $in: minsalary } },
          },
          {
            path: "salaray.max_salary",
            select: "-other_salary",
            match: { _id: { $in: maxsalary } },
          },
        ],
      },
      {
        path: "userid",
        populate: {
          path: "experiencedlevel",
          match: { _id: { $in: experience } },
        },
      },
    ];

    function industryfilter(element) {
      // console.log(salary.some((e)=> element.salaray.min_salary._id == e.min_salary && element.salaray.max_salary._id == e.max_salary))
      // salary.some((e)=> element.salaray.min_salary._id == e.min_salary && element.salaray.max_salary._id == e.max_salary)
      // data.salaray.min_salary.type == 1 && data.salaray.min_salary.salary <= filter.salary.min_salary.salary &&  filter.salary.max_salary.salary <= data.salaray.max_salary.salary

      if (
        element.functionalarea._id == req.body.functionalareaid &&
        industry.some(
          (e) => element.category.some((b) => b._id == e) == true
        ) &&
        element.salaray.min_salary != null &&
        element.salaray.max_salary != null
      ) {
        return true;
      } else {
        return false;
      }
    }
    function educationfilter(element) {
      if (education.some((e) => element.digree.education._id == e)) {
        return true;
      } else {
        return false;
      }
    }

    var seekerdata = await Profiledata.find()
      .populate(populate)
      .then((data) =>
        data.filter((filterdata) => {
          var filterdata2 = filterdata.careerPreference.filter(industryfilter);

          var educationdata2 = filterdata.education.filter(educationfilter);
          console.log(educationdata2.length > 0);
          if (
            filterdata2.length > 0 &&
            educationdata2.length > 0 &&
            filterdata.userid.experiencedlevel != null
          ) {
            return true;
          } else {
            return false;
          }
        })
      );
    res.status(200).send(seekerdata);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post("/candidate_view", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;
    var data = await candidateview.findOne({
      userid: _id,
      candidate_profileid: req.body.candidate_profileid,
    });
    console.log("data", data);
    if (data == null) {
      await candidateview({
        userid: _id,
        candidate_id: req.body.candidate_id,
        candidate_profileid: req.body.candidate_profileid,
      }).save();
      await notifySendWhenRecruterViewProfile(
        _id,
        req.body.candidate_profileid
      );
      await Recruiters.findOneAndUpdate(
        { _id: _id },
        { $inc: { "other.candidate_view": 1 } }
      );
      var chatchannel = await Chat.findOneAndUpdate(
        {
          seekerid: req.body.candidate_id,
          "who_view_me.title": "Who viewed me",
        },
        {
          $set: { "who_view_me.seekerviewid": _id },
          $inc: { "who_view_me.totalview": 1, "who_view_me.newview": 1 },
        }
      );
      if (chatchannel == null) {
        await Chat({
          type: 3,
          seekerid: req.body.candidate_id,
          recruiterid: null,
          who_view_me: {
            title: "Who viewed me",
            totalview: 1,
            newview: 1,
            seekerviewid: _id,
            recruiterview: null,
          },
        }).save();
      }
      res.status(200).json({ message: "Candidate view successfully" });
    } else {
      res.status(200).json({ message: "Candidate already view" });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/functionarea_candidatefilter", tokenverify, async (req, res) => {
  var candidatelist;
  var term = new RegExp(req.query.division, "i");
  var populate = [
    {
      path: "workexperience",
      populate: [
        { path: "category", select: "-functionarea" },
        "expertisearea",
      ],
    },
    {
      path: "education",
      populate: [
        {
          path: "digree",
          select: "-subject",
          populate: { path: "education", select: "-digree" },
        },
        "subject",
      ],
    },
    "protfoliolink",
    "about",
    {
      path: "careerPreference",
      populate: [
        { path: "category", select: "-functionarea" },
        {
          path: "functionalarea",
          match: { $and: [{ _id: req.query.functionalarea }] },
          populate: [{ path: "industryid", select: "-category" }],
        },
        { path: "salaray.min_salary", select: "-other_salary" },
        { path: "salaray.max_salary", select: "-other_salary" },
        { path: "jobtype" },
        {
          path: "division",
          populate: {
            path: "cityid",
            select: "name",
            match: { $and: [{ name: { $regex: term } }] },
          },
        },
      ],
    },
    { path: "userid", populate: { path: "experiencedlevel" } },
  ];

  var populate2 = [
    {
      path: "workexperience",
      populate: [
        { path: "category", select: "-functionarea" },
        "expertisearea",
      ],
    },
    {
      path: "education",
      populate: [
        {
          path: "digree",
          select: "-subject",
          populate: { path: "education", select: "-digree" },
        },
        "subject",
      ],
    },
    "protfoliolink",
    "about",
    {
      path: "careerPreference",
      populate: [
        { path: "category", select: "-functionarea" },
        {
          path: "functionalarea",
          match: { $and: [{ _id: req.query.functionalarea }] },
          populate: [{ path: "industryid", select: "-category" }],
        },
        { path: "salaray.min_salary", select: "-other_salary" },
        { path: "salaray.max_salary", select: "-other_salary" },
        { path: "jobtype" },
        {
          path: "division",
          populate: {
            path: "cityid",
            select: "name",
            match: { $and: [{ _id: req.query.divisionid }] },
          },
        },
      ],
    },
    { path: "userid", populate: { path: "experiencedlevel" } },
  ];

  var populate3 = [
    {
      path: "workexperience",
      populate: [
        { path: "category", select: "-functionarea" },
        "expertisearea",
      ],
    },
    {
      path: "education",
      populate: [
        {
          path: "digree",
          select: "-subject",
          populate: { path: "education", select: "-digree" },
        },
        "subject",
      ],
    },
    "protfoliolink",
    "about",
    {
      path: "careerPreference",
      populate: [
        { path: "category", select: "-functionarea" },
        {
          path: "functionalarea",
          match: { $and: [{ _id: req.query.functionalarea }] },
          populate: [{ path: "industryid", select: "-category" }],
        },
        { path: "salaray.min_salary", select: "-other_salary" },
        { path: "salaray.max_salary", select: "-other_salary" },
        { path: "jobtype" },
        { path: "division", populate: { path: "cityid", select: "name" } },
      ],
    },
    { path: "userid", populate: { path: "experiencedlevel" } },
  ];
  // match: {_id: {$ne: req.query.divisionid}}
  // match: {_id: {$ne: req.query.functionalarea}}

  if (req.query.type == "0") {
    candidatelist = await Profiledata.find()
      .populate(populate)
      .then((e) => {
        return e.filter((data) => {
          var locfilter = data.careerPreference.filter(divisionfilter);
          if (locfilter.length > 0) {
            return true;
          } else {
            return false;
          }
        });
      });
  } else if (req.query.type == "1") {
    candidatelist = await Profiledata.find()
      .sort({ _id: -1 })
      .limit(10)
      .populate(populate3);
  } else if (req.query.type == "2") {
    candidatelist = await Profiledata.find()
      .populate(populate2)
      .then((e) => {
        return e.filter((data) => {
          var locfilter = data.careerPreference.filter(divisionfilter);
          if (locfilter.length > 0) {
            return true;
          } else {
            return false;
          }
        });
      });
  }
  res.status(200).send(candidatelist);
});

function divisionfilter(data) {
  if (data.division.cityid == null) {
    return false;
  } else {
    return true;
  }
}

module.exports = app;
