const express = require("express");
const app = express();
const nodemailer = require("nodemailer");
const smtppool = require("nodemailer");
const mongoose = require("mongoose");
const {
  Expertisearea,
  Category,
  Functionarea,
  Category2,
  Expertisearea2,
} = require("../../Model/industry.js");
const recruiters = require("../../Model/Recruiter/recruiters");
const tokenverify = require("../../MiddleWare/tokenverify.js");
const jwt = require("jsonwebtoken");
const JobReport = require("../../Model/job_report.js");

const { City, Division } = require("../../Model/alllocation.js");
const { Jobtype } = require("../../Model/jobtype.js");
const { Salirietype } = require("../../Model/salarie.js");
const Experince = require("../../Model/experience.js");
const JobPost = require("../../Model/Recruiter/Job_Post/job_post.js");
const { Profiledata } = require("../../Model/Seeker_profile_all_details.js");

const {
  EducationLavel,
  Digree,
  Subject,
} = require("../../Model/education_lavel.js");
const candidateReport = require("../../Model/Recruiter/Candidate_Report/candidate_report");
const {
  CompanyVerify,
} = require("../../Model/Recruiter/Verify/company_verify.js");
const {
  ProfileVerify,
} = require("../../Model/Recruiter/Verify/profile_verify.js");
const {
  notificaton_send_by_verifyAprove,
  notificaton_send_by_jobHidden,
  notificaton_send_by_jobPublice,
  notificaton_send_by_jobDelete,
  verirySuccessMassagesend,
} = require("../../Routers/Notification/notification.js");
const { DefaultSkill } = require("../../Model/Seeker_profile_all_details.js");
const Package = require("../../Model/Package/package.js");
const { populate } = require("dotenv");
const transportar = nodemailer.createTransport({
  host: "premium89-1.web-hosting.com",
  port: 465,
  auth: {
    user: "notifications@unbolt.co",
    pass: "Notifications@Unbolt",
  },
});
const redis = require("../../utils/redis.js");
const verifyToken = require("../../MiddleWare/tokenverify.js");
const PackageBuy = require("../../Model/Package/package_buy.js");
// repoted candidate get
app.get("/candidate_report", async (req, res) => {
  try {
    var data = await candidateReport
      .find()
      .populate([
        {
          path: "candidateid",
          select: "",
          populate: [
            // { path: "company", select: "" },
            // { path: "userid", select: "" },
            "experiencedlevel",
            // "jobtype",
          ],
        },
        {
          path: "candidatefulldetailsid",
          select: "",
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
            "skill",
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
                { path: "functionalarea", populate: [{ path: "industryid" }] },
                {
                  path: "division",
                  populate: { path: "cityid", select: "-divisionid" },
                },
                "jobtype",

                {
                  path: "salaray",
                  populate: [{ path: "max_salary" }, { path: "min_salary" }],
                },
              ],
            },
            { path: "userid", populate: { path: "experiencedlevel" } },
          ],
        },
      ])
      .sort({ createdAt: -1 });
    res.status(200).json(data);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/candidate_report/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: id };
  const candidate = await candidateReport.findOne(query).populate([
    {
      path: "candidateid",
      select: "",
      populate: [
        // { path: "company", select: "" },
        // { path: "userid", select: "" },
        "experiencedlevel",
        // "jobtype",
      ],
    },
  ]);
  res.send(candidate);
});

//  job_report get
app.get("/job_report", async (req, res) => {
  try {
    var data = await JobReport.find().populate([
      {
        path: "jobid",
        select: "",
        populate: [
          {
            path: "company",
            select: "",
            populate: [
              {
                path: "industry",
                select: "",
                populate: ["industryid"],
              },
            ],
          },
          { path: "userid", select: "" },
          "education",
          "jobtype",
        ],
      },
      {
        path: "userid",
        select: "",
        populate: [],
      },
    ]);
    res.status(200).json(data);
  } catch (error) {
    res.status(400).send(error);
  }
});
app.get("/job_report/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: id };
  const candidate = await JobReport.findOne(query).populate([
    {
      path: "jobid",
      select: "",
      populate: [
        { path: "company", select: "" },
        { path: "userid", select: "" },
        "education",
        "jobtype",
      ],
    },
  ]);
  res.send(candidate);
});

app.get("/jobreportbyseeker", async (req, res) => {
  const seeker = req.query.userid;
  const query = { userid: seeker };
  console.log(query);
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
    "skill",
    "protfoliolink",
    "about",
    {
      path: "careerPreference",
      populate: [
        { path: "salaray", populate: ["max_salary", "min_salary"] },
        { path: "category", select: "-functionarea" },
        { path: "functionalarea", populate: [{ path: "industryid" }] },
        {
          path: "division",
          populate: { path: "cityid", select: "-divisionid" },
        },
        "jobtype",
      ],
    },
    { path: "userid", populate: { path: "experiencedlevel" } },
  ];
  const date = await Profiledata.findOne(query).populate(populate2);
  res.send(date);
});

app.get("/premium_user", async (req, res) => {
  const premium = req.query.premium;
  const filter = { "other.premium": premium };
  var data = await recruiters.find(filter);
  res.status(200).json(data);
  // console.log(filter);
});
app.get("/not_premium_user", async (req, res) => {
  try {
    const premium = req.query.premium;
    const filter = { premium: premium === "false" };
    var data = await recruiters.find(filter);
    res.status(200).json(data);
  } catch (error) {
    res.status(400).send(error);
  }
});

// company and profile verify doc and verify

app.get("/verifyCompny", async (req, res) => {
  try {
    var data = await CompanyVerify.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/company_varify", async (req, res) => {
  const useridd = req.query.userid;
  const query = { userid: useridd };
  // console.log(query);

  const date = await CompanyVerify.findOne(query);
  // console.log(date);
  res.send(date);
});

app.get("/verifyProfiledocument", async (req, res) => {
  try {
    const useridd = req.query.userid;
    const query = { userid: useridd };
    var data = await ProfileVerify.findOne(query).populate("userid");
    console.log(query);
    res.status(200).json(data);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/profile_varify/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: id };
  const date = await ProfileVerify.findOne(query);
  res.send(date);
});

// company and profile verify doc and verify

app.get("/verifyRecruterCompny", async (req, res) => {
  const id = req.query._id;
  const query = { _id: id };
  // console.log(query);
  const date = await recruiters.findOne(query).populate("");
  res.send(date);
});

app.patch("/verifyRecruterCompny/:_id", tokenverify, async (req, res) => {
  const id = req.params._id;
  const filter = { _id: id };
  // const options = { upsert: true };
  const updateDoc = {
    $set: { "other.company_verify": true },
  };
  const result = await recruiters.findByIdAndUpdate(filter, updateDoc);
  res.send(result);
});
app.patch("/job_hidden_true/:_id", tokenverify, async (req, res) => {
  const id = req.params._id;
  const filter = { _id: id };
  // const options = { upsert: true };
  const updateDoc = {
    $set: { job_hidden: true },
  };
  const result = await JobPost.findByIdAndUpdate(filter, updateDoc);
  const mapdata = {
    verificationType: "profile", // Indicate the type of verification (profile or company)
    userId: id, // The ID of the recruiter being verified
  };
  // Call the notification function
  await notificaton_send_by_jobHidden(id, mapdata);
  res.send(result);
});
app.patch("/job_hidden_false/:_id", tokenverify, async (req, res) => {
  const id = req.params._id;
  const filter = { _id: id };
  // const options = { upsert: true };
  const updateDoc = {
    $set: { job_hidden: false },
  };
  const result = await JobPost.findByIdAndUpdate(filter, updateDoc);
  const mapdata = {
    verificationType: "profile", // Indicate the type of verification (profile or company)
    userId: id, // The ID of the recruiter being verified
  };

  // Call the notification function
  await notificaton_send_by_jobPublice(id, mapdata);
  res.send(result);
});
app.delete("/admin/job_delete/:id", tokenverify, async (req, res) => {
  try {
    const result = await JobPost.findByIdAndDelete(req.params.id);

    if (!req.params.id) {
      return res.status(404).send();
    }
    const mapdata = {
      verificationType: "profile", // Indicate the type of verification (profile or company)
      userId: id, // The ID of the recruiter being verified
    };

    // Call the notification function
    await notificaton_send_by_jobDelete(id, mapdata);
    res.send(result);
  } catch (error) {
    res.send(error);
  }
});
app.get("/admin/job_list", async (req, res) => {
  const job_hidden = req.query.job_hidden;
  const filter = { job_hidden: job_hidden };
  var populate = [
    "userid",
    "experience",
    "education",
    { path: "salary.min_salary", select: "-other_salary" },
    { path: "salary.max_salary", select: "-other_salary" },
    { path: "expertice_area", populate: ["industryid"] },
    {
      path: "company",
      populate: [{ path: "c_size" }, { path: "industry", select: "-category" }],
    },
    "jobtype",
  ];
  var data = await JobPost.find(filter).sort("-updatedAt").populate(populate);
  res.status(200).json(data);
  // console.log(filter);
});

app.get("/profile_verifys_type", async (req, res) => {
  const profile_verify_type = req.query.profile_verify_type;
  const filter = { "other.profile_verify_type": profile_verify_type };
  var data = await recruiters.find(filter).populate([
    {
      path: "companyname",
      select: "",
      populate: [
        // { path: "company", select: "" },
        { path: "industry", select: "", populate: ["industryid"] },
        {
          path: "c_location",
          select: "",
          populate: [
            {
              path: "divisiondata",
              populate: [{ path: "cityid" }],
            },
          ],
        },
        "c_size",
      ],
    },
  ]);
  res.status(200).json(data);
  // console.log(filter);
});

app.get("/admin_all_recruter_profile", async (req, res) => {
  var data = await recruiters.find().populate([
    {
      path: "companyname",
      select: "",
      populate: [
        // { path: "company", select: "" },
        { path: "industry", select: "", populate: ["industryid"] },
        "c_size",
      ],
    },
  ]);
  res.status(200).json(data);
  // console.log(filter);
});

//
app.get("/profile_verifys", async (req, res) => {
  const profile_verify_type = req.query.profile_verify_type;
  const filter = { "other.profile_verify_type": profile_verify_type };
  var data = await recruiters
    .find(filter)
    .populate([
      {
        path: "companyname",
        select: "",
        populate: [
          {
            path: "c_location",
            select: "",
            populate: [
              {
                path: "divisiondata",
                populate: [{ path: "cityid" }],
              },
            ],
          },
          { path: "industry", select: "", populate: ["industryid"] },
          "c_size",
        ],
      },
    ])
    .sort({ createdAt: -1 });
  res.status(200).json(data);
  // console.log(filter);
});
app.get("/profile_varifys/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: id };
  const date = await recruiters.findOne(query).populate([
    {
      path: "companyname",
      select: "",
      populate: [
        // { path: "company", select: "" },
        // { path: "userid", select: "" },
        "c_size",
        "industry",
      ],
    },
  ]);
  res.send(date);
});

//

app.patch("/verifyRecruterProfile/:_id", tokenverify, async (req, res) => {
  try {
    const id = req.params._id;
    const filter = { _id: id };
    const updateDoc = {
      $set: {
        "other.profile_verify_type": 1,
        "other.company_verify_type": 1,
        "other.profile_verify": true,
        "other.company_verify": true,
      },
    };

    const result = await recruiters.findByIdAndUpdate(filter, updateDoc);

    await verirySuccessMassagesend(id);

    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

app.patch("/rejectRecruterProfile/:_id", tokenverify, async (req, res) => {
  const id = req.params._id;
  const filter = { _id: id };
  // const options = { upsert: true };
  const updateDoc = {
    $set: {
      "other.profile_verify_type": 2,
      "other.company_verify_type": 2,
      "other.profile_verify": false,
      "other.company_verify": false,
    },
  };
  const result = await recruiters.findByIdAndUpdate(filter, updateDoc);

  res.send(result);
});
app.patch("/unverifyRecruterProfile/:_id", tokenverify, async (req, res) => {
  const id = req.params._id;
  const filter = { _id: id };
  // const options = { upsert: true };
  const updateDoc = {
    $set: {
      "other.profile_verify_type": 0,
      "other.company_verify_type": 0,
      "other.profile_verify": false,
      "other.company_verify": false,
    },
  };
  const result = await recruiters.findByIdAndUpdate(filter, updateDoc);
  res.send(result);
});

app.patch(
  "/verifyRecruterProfile_underVerifecation/:_id",
  tokenverify,
  async (req, res) => {
    try {
      const id = req.params._id;
      const filter = { _id: id };
      const updateDoc = {
        $set: {
          "other.profile_verify_type": 3,
          "other.company_verify_type": 3,
          "other.profile_verify": true,
          "other.company_verify": true,
        },
      };

      const result = await recruiters.findByIdAndUpdate(filter, updateDoc);

      await verirySuccessMassagesend(id);

      res.send(result);
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal server error");
    }
  }
);

app.get("/verifyRecruterProfile", async (req, res) => {
  const id = req.query._id;
  const query = { _id: id };
  // console.log(query);
  const date = await recruiters.findOne(query).populate([
    {
      path: "companyname",
      select: "",
      populate: [
        // { path: "company", select: "" },
        // { path: "userid", select: "" },
        "c_size",
        "industry",
      ],
    },
  ]);
  res.send(date);
});

// candidate list

app.get("/admin/candidatelist", async (req, res) => {
  try {
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
      "skill",
      "protfoliolink",
      "about",
      {
        path: "careerPreference",
        populate: [
          { path: "salaray", populate: ["max_salary", "min_salary"] },
          { path: "category", select: "-functionarea" },
          { path: "functionalarea", populate: [{ path: "industryid" }] },
          {
            path: "division",
            populate: { path: "cityid", select: "-divisionid" },
          },
          "jobtype",
        ],
      },
      { path: "userid", populate: { path: "experiencedlevel" } },
    ];
    var data = await Profiledata.find()
      .populate(populate2)
      .sort({ createdAt: -1 });
    res.status(200).json(data);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/candidate/:id", async (req, res) => {
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
    "skill",
    "protfoliolink",
    "about",
    {
      path: "careerPreference",
      populate: [
        { path: "salaray", populate: ["max_salary", "min_salary"] },
        { path: "category", select: "-functionarea" },
        { path: "functionalarea", populate: [{ path: "industryid" }] },
        {
          path: "division",
          populate: { path: "cityid", select: "-divisionid" },
        },
        "jobtype",
      ],
    },
    { path: "userid", populate: { path: "experiencedlevel" } },
  ];
  const id = req.params.id;
  const query = { _id: id };
  const date = await Profiledata.findOne(query).populate(populate2);
  res.send(date);
});

//sort area bulk update
app.patch("/admin/industry_update_bulk", tokenverify, async (req, res) => {
  try {
    var updateData = req.body;

    console.log(updateData);

    const bulkUpdateOperations = updateData.map(({ id, sortOrder }) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(id) },
        update: { $set: { sortOrder } },
      },
    }));
    await Expertisearea.bulkWrite(bulkUpdateOperations);
    const cacheKey = `adminindustry`;
    await redis.del(cacheKey);
    res.status(200).json({ message: "update successfull" });
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});

app.get("/admin/industry", async (req, res) => {
  try {
    const cacheKey = `adminindustry`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log("sending data from redis");
      return res.status(200).json(JSON.parse(cachedData));
    }
    var industrydata = await Expertisearea.find()
      .populate([{ path: "category", populate: ["functionarea"] }])
      .sort("sortOrder");
    res.status(200).json(industrydata);
    //save to redis for 1 hour
    redis.set(cacheKey, JSON.stringify(industrydata), 60 * 60 * 24 * 7);
  } catch (error) {
    res.status(400).send(error);
  }
});

// industry add
app.post("/industryadd", tokenverify, async (req, res) => {
  try {
    var industrydata = await Expertisearea.findOne({
      industryname: req.body.industryname,
    });
    if (industrydata == null) {
      await Expertisearea({ industryname: req.body.industryname }).save();
      const cacheKey = `adminindustry`;
      await redis.del(cacheKey);
      res.json({ message: "industry add successfull" });
    } else {
      res.status(400).json({ message: "industry already added" });
    }
  } catch (error) {
    res.send(error);
  }
});

app.post("/industry_update/:_id", tokenverify, async (req, res) => {
  try {
    const _id = req.params._id;
    await Expertisearea.findByIdAndUpdate(
      _id,
      {
        $set: {
          industryname: req.body.industryname,
        },
      },
      {
        new: true,
      }
    );
    const cacheKey = `adminindustry`;
    await redis.del(cacheKey);
    res.status(200).json({ message: "update successfull" });
  } catch (error) {
    res.status(404).send(error);
  }
});

// industry 2 add
app.post("/industry2add", tokenverify, async (req, res) => {
  try {
    var industrydata = await Expertisearea2.findOne({
      industryname: req.body.industryname,
    });
    if (industrydata == null) {
      await Expertisearea2({ industryname: req.body.industryname }).save();
      const cacheKey = `admin_industry2`;
      await redis.del(cacheKey);
      res.json({ message: "industry add successfull" });
    } else {
      res.status(400).json({ message: "industry already added" });
    }
  } catch (error) {
    res.send(error);
  }
});

// industry 2 get

app.get("/admin/industry2", async (req, res) => {
  try {
    const cacheKey = `admin_industry2`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log("sending data from redis");
      return res.status(200).json(JSON.parse(cachedData));
    }
    var industrydata = await Expertisearea2.find()
      .populate("category")
      .sort("sortOrder");
    res.status(200).json(industrydata);
    redis.set(cacheKey, JSON.stringify(industrydata), 60 * 60 * 24 * 7);
  } catch (error) {
    res.status(400).send(error);
  }
});

//sort area bulk update
app.patch("/admin/industry2_update_bulk", tokenverify, async (req, res) => {
  try {
    var updateData = req.body;

    console.log(updateData);

    const bulkUpdateOperations = updateData.map(({ id, sortOrder }) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(id) },
        update: { $set: { sortOrder } },
      },
    }));
    await Expertisearea2.bulkWrite(bulkUpdateOperations);
    const cacheKey = `admin_industry2`;
    await redis.del(cacheKey);
    res.status(200).json({ message: "update successfull" });
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});

app.post("/industry_update2/:_id", tokenverify, async (req, res) => {
  try {
    const _id = req.params._id;
    await Expertisearea2.findByIdAndUpdate(
      _id,
      {
        $set: {
          industryname: req.body.industryname,
        },
      },
      {
        new: true,
      }
    );

    const cacheKey = `admin_industry2`;
    await redis.del(cacheKey);
    res.status(200).json({ message: "update successfull" });
  } catch (error) {
    res.status(404).send(error);
  }
});

//category get

app.get("/admin/category", async (req, res) => {
  try {
    const cacheKey = `admin_category`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log("sending data from redis");
      return res.status(200).json(JSON.parse(cachedData));
    }
    var data = await Category.find()
      .populate(["industryid", "functionarea"])
      .sort("sortOrder");
    res.status(200).json(data);
    redis.set(cacheKey, JSON.stringify(data), 60 * 60 * 24 * 7);
  } catch (error) {
    res.status(400).send(error);
  }
});
//sort area bulk update
app.patch("/admin/category_update_bulk", tokenverify, async (req, res) => {
  try {
    var updateData = req.body;

    console.log(updateData);

    const bulkUpdateOperations = updateData.map(({ id, sortOrder }) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(id) },
        update: { $set: { sortOrder } },
      },
    }));
    await Category.bulkWrite(bulkUpdateOperations);
    const cacheKey = `admin_category`;
    await redis.del(cacheKey);
    res.status(200).json({ message: "update successfull" });
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});
app.patch("/category_update/:_id", tokenverify, async (req, res) => {
  try {
    const _id = req.params._id;
    await Category.findByIdAndUpdate(
      _id,
      {
        $set: {
          categoryname: req.body.categoryname,
        },
      },
      {
        new: true,
      }
    );
    const cacheKey = `admin_category`;
    await redis.del(cacheKey);
    res.status(200).json({ message: "update successfull" });
  } catch (error) {
    res.status(404).send(error);
  }
});

app.post("/categoryadd", tokenverify, async (req, res) => {
  try {
    var categorydata = await Category.findOne({
      categoryname: req.body.categoryname,
    });
    if (categorydata == null || categorydata !== null) {
      var catdata = await Category({
        categoryname: req.body.categoryname,
        industryid: req.body.industryid,
      });
      catdata.save();
      await Expertisearea.findByIdAndUpdate(req.body.industryid, {
        $push: { category: catdata._id },
      });
      const cacheKey = `admin_category`;
      await redis.del(cacheKey);
      res.json({ message: "Categor add successfull" });
    } else {
      res.status(400).json({ message: "Category already added" });
    }
  } catch (error) {
    res.send(error);
  }
});

// category 2 add

app.post("/category2add", tokenverify, async (req, res) => {
  try {
    var categorydata = await Category2.findOne({
      categoryname: req.body.categoryname,
    });
    if (categorydata == null || categorydata !== null) {
      var catdata = await Category2({
        categoryname: req.body.categoryname,
        industryid: req.body.industryid,
      });
      catdata.save();
      await Expertisearea2.findByIdAndUpdate(req.body.industryid, {
        $push: { category: catdata._id },
      });
      const cacheKey = `admin_category2`;
      await redis.del(cacheKey);
      res.json({ message: "Categor add successfull" });
    } else {
      res.status(400).json({ message: "Category already added" });
    }
  } catch (error) {
    res.send(error);
  }
});

// category 2 update

app.patch("/category2_update/:_id", tokenverify, async (req, res) => {
  try {
    const _id = req.params._id;
    await Category2.findByIdAndUpdate(
      _id,
      {
        $set: {
          categoryname: req.body.categoryname,
        },
      },
      {
        new: true,
      }
    );
    const cacheKey = `admin_category2`;
    await redis.del(cacheKey);
    res.status(200).json({ message: "update successfull" });
  } catch (error) {
    res.status(404).send(error);
  }
});

//sort area bulk update
app.patch("/category2_update_bulk", tokenverify, async (req, res) => {
  try {
    var updateData = req.body;

    console.log(updateData);

    const bulkUpdateOperations = updateData.map(({ id, sortOrder }) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(id) },
        update: { $set: { sortOrder } },
      },
    }));
    await Category2.bulkWrite(bulkUpdateOperations);
    const cacheKey = `admin_category2`;
    await redis.del(cacheKey);
    res.status(200).json({ message: "update successfull" });
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});

// category 2 get

app.get("/admin/category2", async (req, res) => {
  try {
    const cacheKey = `admin_category2`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log("sending data from redis");
      return res.status(200).json(JSON.parse(cachedData));
    }
    var data = await Category2.find()
      .populate([{ path: "industryid", select: "-category" }])
      .sort("sortOrder");
    res.status(200).json(data);
    redis.set(cacheKey, JSON.stringify(data), 60 * 60 * 24 * 7);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.delete("/admin/industry/:id", tokenverify, async (req, res) => {
  try {
    const result = await Expertisearea.findByIdAndDelete(req.params.id);
    // await Category.deleteMany({industryid: req.params.id})
    // await Functionarea.deleteMany({})
    if (!req.params.id) {
      return res.status(404).send();
    }
    const cacheKey = `adminindustry`;
    await redis.del(cacheKey);
    res.send(result);
  } catch (error) {
    res.send(error);
  }
});
app.delete("/admin/industry2/:id", tokenverify, async (req, res) => {
  try {
    const result = await Expertisearea2.findByIdAndDelete(req.params.id);
    // await Category.deleteMany({industryid: req.params.id})
    // await Functionarea.deleteMany({})
    if (!req.params.id) {
      return res.status(404).send();
    }
    const cacheKey = `admin_industry2`;
    await redis.del(cacheKey);
    res.send(result);
  } catch (error) {
    res.send(error);
  }
});

app.delete("/admin/category/:id", tokenverify, async (req, res) => {
  try {
    const result = await Category.findByIdAndDelete(req.params.id);
    await Functionarea.deleteMany({ categoryid: req.params.id });
    if (!req.params.id) {
      return res.status(404).send();
    }
    const cacheKey = `admin_category`;
    await redis.del(cacheKey);
    res.send(result);
  } catch (error) {
    res.send(error);
  }
});
app.delete("/admin/category2/:id", tokenverify, async (req, res) => {
  try {
    const result = await Category2.findByIdAndDelete(req.params.id);
    await Functionarea.deleteMany({ categoryid: req.params.id });
    if (!req.params.id) {
      return res.status(404).send();
    }
    const cacheKey = `admin_category2`;
    await redis.del(cacheKey);
    res.send(result);
  } catch (error) {
    res.send(error);
  }
});

app.delete("/admin/functionalarea/:id", tokenverify, async (req, res) => {
  try {
    const result = await Functionarea.findByIdAndDelete(req.params.id);
    if (!req.params.id) {
      return res.status(404).send();
    }
    const cacheKey = `admin_functionalarea`;
    await redis.del(cacheKey);
    res.send(result);
  } catch (error) {
    res.send(error);
  }
});

app.delete("/admin/location/:id", tokenverify, async (req, res) => {
  try {
    var data = await City.findOneAndDelete({
      _id: req.params.id,
    });
    if (data == null) {
      res.status(400).json({ message: "iteam not found" });
    } else {
      await Division.findManyAndUpdate({ $pull: { Division: data._id } });
      res.status(200).json({ message: "Delete Sucessfull" });
    }
  } catch (error) {
    res.send(error);
  }
});

app.delete("/admin/salarie/:id", tokenverify, async (req, res) => {
  try {
    const result = await Salirietype.findByIdAndDelete(req.params.id);
    if (!req.params.id) {
      return res.status(404).send();
    }
    res.send(result);
  } catch (error) {
    res.send(error);
  }
});

app.delete("/admin/jobtype/:id", tokenverify, async (req, res) => {
  try {
    const result = await Jobtype.findByIdAndDelete(req.params.id);
    if (!req.params.id) {
      return res.status(404).send();
    }
    res.send(result);
  } catch (error) {
    res.send(error);
  }
});

app.delete("/admin/digree/:id", tokenverify, async (req, res) => {
  try {
    var data = await Digree.findOneAndDelete({
      _id: req.params.id,
    });
    if (data == null) {
      res.status(400).json({ message: "iteam not found" });
    } else {
      await EducationLavel.findManyAndUpdate({
        $pull: { EducationLavel: data._id },
      });
      await Subject.findManyAndUpdate({ $pull: { Subject: data._id } });

      const cacheKey = `admin_digree`;
      await redis.del(cacheKey);
      res.status(200).json({ message: "Delete Sucessfull" });
    }

    res.send(result);
  } catch (error) {
    res.send(error);
  }
});

app.delete("/admin/education_lavel/:id", tokenverify, async (req, res) => {
  try {
    var data = await EducationLavel.findOneAndDelete({
      _id: req.params.id,
    });
    if (data == null) {
      res.status(400).json({ message: "iteam not found" });
    } else {
      await Digree.findManyAndUpdate({ $pull: { Digree: data._id } });
      await Subject.findManyAndUpdate({ $pull: { Subject: data._id } });

      const cacheKey = `education_lavel`;
      await redis.del(cacheKey);
      res.status(200).json({ message: "Delete Sucessfull" });
    }
  } catch (error) {
    res.send(error);
  }
});

app.delete("/admin/subject/:id", tokenverify, async (req, res) => {
  try {
    var data = await Subject.findOneAndDelete({
      _id: req.params.id,
    });
    if (data == null) {
      res.status(400).json({ message: "iteam not found" });
    } else {
      await Digree.findManyAndUpdate({ $pull: { digree: data._id } });
      res.status(200).json({ message: "Delete Sucessfull" });
    }
  } catch (error) {
    res.send(error);
  }
});

// functional area add

app.get("/admin/functionalarea", async (req, res) => {
  try {
    const cacheKey = `admin_functionalarea`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log("sending data from redis");
      return res.status(200).json(JSON.parse(cachedData));
    }
    var data = await Functionarea.find()
      .populate(["industryid", "categoryid"])
      .sort("sortOrder");
    res.json(data);
    redis.set(cacheKey, JSON.stringify(data), 60 * 60 * 24 * 7);
  } catch (error) {
    res.send(error);
  }
});
//sort area bulk update
app.patch(
  "/admin/functionalarea_update_bulk",
  tokenverify,
  async (req, res) => {
    try {
      var updateData = req.body;

      console.log(updateData);

      const bulkUpdateOperations = updateData.map(({ id, sortOrder }) => ({
        updateOne: {
          filter: { _id: new mongoose.Types.ObjectId(id) },
          update: { $set: { sortOrder } },
        },
      }));
      await Functionarea.bulkWrite(bulkUpdateOperations);
      const cacheKey = `admin_functionalarea`;
      await redis.del(cacheKey);
      res.status(200).json({ message: "update successfull" });
    } catch (error) {
      console.log(error);
      res.status(404).send(error);
    }
  }
);
app.patch("/functional_update/:_id", tokenverify, async (req, res) => {
  try {
    const _id = req.params._id;
    await Functionarea.findByIdAndUpdate(
      _id,
      {
        $set: {
          functionalname: req.body.functionalname,
        },
      },
      {
        new: true,
      }
    );
    const cacheKey = `admin_functionalarea`;
    await redis.del(cacheKey);
    res.status(200).json({ message: "update successfull" });
  } catch (error) {
    res.status(404).send(error);
  }
});

app.post("/functionalareaadd", tokenverify, async (req, res) => {
  try {
    var functionaldata = await Functionarea.findOne({
      functionalname: req.body.functionalname,
    });
    if (functionaldata == null || functionaldata !== null) {
      var functionarea = await Functionarea({
        industryid: req.body.industryid,
        categoryid: req.body.categoryid,
        functionalname: req.body.functionalname,
      });
      functionarea.save();
      await Category.findByIdAndUpdate(req.body.categoryid, {
        $push: { functionarea: functionarea._id },
      });
      const cacheKey = `admin_functionalarea`;
      await redis.del(cacheKey);
      res.json({ message: "Functional Area add successfull" });
    } else {
      res.status(400).json({ message: "Functional Area already added" });
    }
  } catch (error) {
    res.send(error);
  }
});

app.get("/admin/location", async (req, res) => {
  try {
    const cacheKey = `adminlocation`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log("sending data from redis");
      return res.status(200).json(JSON.parse(cachedData));
    }
    var data = await City.find()
      .populate({
        path: "divisionid",
        populate: [{ path: "cityid", select: "-divisionid" }],
      })
      .sort("sortOrder");
    res.json(data);
    redis.set(cacheKey, JSON.stringify(data), 60 * 60 * 24 * 7);
  } catch (error) {
    res.send(error);
  }
});
//sort area bulk update
app.patch("/admin/location_update_bulk", tokenverify, async (req, res) => {
  try {
    var updateData = req.body;

    console.log(updateData);

    const bulkUpdateOperations = updateData.map(({ id, sortOrder }) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(id) },
        update: { $set: { sortOrder } },
      },
    }));
    await City.bulkWrite(bulkUpdateOperations);
    const cacheKey = `admin_location`;
    await redis.del(cacheKey);
    res.status(200).json({ message: "update successfull" });
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});

app.patch("/location_update/:_id", tokenverify, async (req, res) => {
  try {
    const _id = req.params._id;
    await City.findByIdAndUpdate(
      _id,
      {
        $set: {
          name: req.body.name,
        },
      },
      {
        new: true,
      }
    );
    const cacheKey = `admin_location`;
    await redis.del(cacheKey);
    res.status(200).json({ message: "update successfull" });
  } catch (error) {
    res.status(404).send(error);
  }
});

app.post("/location", tokenverify, async (req, res) => {
  try {
    var citydata = await City.findOne({ name: req.body.city });
    var divisiondata = await City.findOne({
      divisionname: req.body.division,
    });
    var city;
    var division;
    if (citydata == null) {
      city = await City({ name: req.body.city });
      city.save();
      const cacheKey = `admin_location`;
      await redis.del(cacheKey);
    }
    if (divisiondata == null || divisiondata !== null) {
      division = await Division({
        divisionname: req.body.division,
        cityid: citydata == null ? city._id : citydata._id,
      });
      division.save();
      await City.findOneAndUpdate(
        { name: req.body.city },
        { $push: { divisionid: division._id } }
      );
      const cacheKey = `admin_location`;
      await redis.del(cacheKey);
      res.status(200).json({ message: "Add Successfull" });
    } else {
      res.status(400).json({ message: "already added" });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/admin/city", async (req, res) => {
  try {
    const cacheKey = `admin_city`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log("sending data from redis");
      return res.status(200).json(JSON.parse(cachedData));
    }
    var data = await Division.find().populate("cityid").sort("sortOrder");
    res.json(data);
    redis.set(cacheKey, JSON.stringify(data), 60 * 60 * 24 * 7);
  } catch (error) {
    res.send(error);
  }
});
//sort area bulk update
app.patch("/admin/city_update_bulk", tokenverify, async (req, res) => {
  try {
    var updateData = req.body;

    console.log(updateData);

    const bulkUpdateOperations = updateData.map(({ id, sortOrder }) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(id) },
        update: { $set: { sortOrder } },
      },
    }));
    await Division.bulkWrite(bulkUpdateOperations);

    res.status(200).json({ message: "update successfull" });
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});
app.delete("/admin/city/:id", tokenverify, async (req, res) => {
  try {
    const result = await Division.findByIdAndDelete(req.params.id);
    if (!req.params.id) {
      return res.status(404).send();
    }
    res.send(result);
  } catch (error) {
    res.send(error);
  }
});

app.patch("/city_update/:_id", tokenverify, async (req, res) => {
  try {
    const _id = req.params._id;
    await Division.findByIdAndUpdate(
      _id,
      {
        $set: {
          divisionname: req.body.divisionname,
        },
      },
      {
        new: true,
      }
    );

    res.status(200).json({ message: "update successfull" });
  } catch (error) {
    res.status(404).send(error);
  }
});

// # post salarietype
app.get("/admin/salarie", async (req, res) => {
  try {
    const cacheKey = `admin_salarie`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log("sending data from redis");
      return res.status(200).json(JSON.parse(cachedData));
    }
    const data = await Salirietype.find({}, { other_salary: { $slice: 6 } })
      .populate({ path: "other_salary", select: "-other_salary" })
      .sort("sortOrder");

    // var data = await Salirietype.find();
    res.json(data);
    redis.set(cacheKey, JSON.stringify(data), 60 * 60 * 24 * 7);
  } catch (error) {
    res.send(error);
  }
});

//sort area bulk update
app.patch("/admin/salirietype_update_bulk", tokenverify, async (req, res) => {
  try {
    var updateData = req.body;

    console.log(updateData);

    const bulkUpdateOperations = updateData.map(({ id, sortOrder }) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(id) },
        update: { $set: { sortOrder } },
      },
    }));
    await Salirietype.bulkWrite(bulkUpdateOperations);
    const cacheKey = `admin_salarie`;
    await redis.del(cacheKey);
    res.status(200).json({ message: "update successfull" });
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});

app.post("/salarietype", tokenverify, async (req, res) => {
  if (req.body.type == 0) {
    var salary = await Salirietype({
      salary: "Negotiable",
      type: req.body.type,
      currency: req.body.currency,
      simbol: req.body.simbol,
    });
    await salary.save();
    await Salirietype.findOneAndUpdate(
      { _id: salary._id },
      { $addToSet: { other_salary: salary._id } }
    );
    const cacheKey = `admin_salarie`;
    await redis.del(cacheKey);
    res.status(200).json({ message: "add successfull" });
  } else {
    var salary = await Salirietype({
      salary: req.body.salary,
      type: req.body.type,
      currency: req.body.currency,
      simbol: req.body.simbol,
    });
    await Salirietype.updateMany(
      {},
      { $addToSet: { other_salary: salary._id } }
    );
    await salary.save();
    const cacheKey = `admin_salarie`;
    await redis.del(cacheKey);
    res.status(200).json({ message: "Salary add successfull" });
  }
});

app.post("/edit_salarietype/:_id", tokenverify, async (req, res) => {
  try {
    const _id = req.params._id;
    await Salirietype.findByIdAndUpdate(
      _id,
      {
        $set: {
          salary: req.body.salary,
          simbol: req.body.simbol,
          type: req.body.type,
          currency: req.body.currency,
        },
      },
      {
        new: true,
      }
    );
    const cacheKey = `admin_salarie`;
    await redis.del(cacheKey);
    res.status(200).json({ message: "update successfull" });
  } catch (error) {
    res.status(404).send(error);
  }
});

// # get jobtype data

app.get("/admin/jobtype", async (req, res) => {
  try {
    const jobtypeData = await Jobtype.find().sort("sortOrder");
    res.send(jobtypeData);
  } catch (error) {
    res.send(error);
  }
});

//sort area bulk update
app.patch("/admin/jobtype_update_bulk", tokenverify, async (req, res) => {
  try {
    var updateData = req.body;

    console.log(updateData);

    const bulkUpdateOperations = updateData.map(({ id, sortOrder }) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(id) },
        update: { $set: { sortOrder } },
      },
    }));
    await Jobtype.bulkWrite(bulkUpdateOperations);

    res.status(200).json({ message: "update successfull" });
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});

app.post("/jobtype", tokenverify, async (req, res) => {
  try {
    var jobtype = await Jobtype.findOne(req.body);
    if (jobtype == null) {
      const jobtypeData = await Jobtype(req.body);
      const jobData = await jobtypeData.save();
      res.status(200).send(jobData);
    } else {
      res.status(400).json({ message: "allready added" });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/admin/digree", async (req, res) => {
  try {
    const cacheKey = `admin_digree`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log("sending data from redis");
      return res.status(200).json(JSON.parse(cachedData));
    }
    const Data = await Digree.find()
      .populate(["education", "subject"])
      .sort("sortOrder");
    res.send(Data);
    redis.set(cacheKey, JSON.stringify(Data), 60 * 60 * 24 * 7);
  } catch (error) {
    res.send(error);
  }
});
//sort area bulk update
app.patch("/admin/digree_update_bulk", tokenverify, async (req, res) => {
  try {
    var updateData = req.body;

    console.log(updateData);

    const bulkUpdateOperations = updateData.map(({ id, sortOrder }) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(id) },
        update: { $set: { sortOrder } },
      },
    }));
    await Digree.bulkWrite(bulkUpdateOperations);
    const cacheKey = `admin_digree`;
    await redis.del(cacheKey);
    res.status(200).json({ message: "update successfull" });
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});

app.get("/admin/subject", async (req, res) => {
  try {
    const Data = await Subject.find()
      .populate(["educaton", "digree"])
      .sort("sortOrder");
    res.send(Data);
  } catch (error) {
    res.send(error);
  }
});
//sort area bulk update
app.patch("/admin/subject_update_bulk", tokenverify, async (req, res) => {
  try {
    var updateData = req.body;

    console.log(updateData);

    const bulkUpdateOperations = updateData.map(({ id, sortOrder }) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(id) },
        update: { $set: { sortOrder } },
      },
    }));
    await Subject.bulkWrite(bulkUpdateOperations);

    res.status(200).json({ message: "update successfull" });
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});

app.post("/education_lavel", tokenverify, async (req, res) => {
  try {
    var data = await EducationLavel.findOne(req.body);
    if (data == null || data !== null) {
      await EducationLavel(req.body).save();
      const cacheKey = `education_lavel`;
      await redis.del(cacheKey);
      res.status(200).json({ message: "add successfull" });
    } else {
      res.status(200).json({ message: "all ready added" });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

app.patch("/education_update/:_id", tokenverify, async (req, res) => {
  try {
    const _id = req.params._id;
    await EducationLavel.findByIdAndUpdate(
      _id,
      {
        $set: {
          name: req.body.name,
        },
      },
      {
        new: true,
      }
    );

    res.status(200).json({ message: "update successfull" });
  } catch (error) {
    res.status(404).send(error);
  }
});

app.get("/education_lavel", async (req, res) => {
  try {
    const cacheKey = `education_lavel`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log("sending data from redis");
      return res.status(200).json(JSON.parse(cachedData));
    }
    var data = await EducationLavel.find()
      .populate([{ path: "digree", select: "-subject" }])
      .sort("sortOrder");
    res.status(200).send(data);
    redis.set(cacheKey, JSON.stringify(data), 60 * 60 * 24 * 7);
  } catch (error) {
    res.send(error);
  }
});
//sort area bulk update
app.patch(
  "/admin/education_lavel_update_bulk",
  tokenverify,
  async (req, res) => {
    try {
      var updateData = req.body;

      console.log(updateData);

      const bulkUpdateOperations = updateData.map(({ id, sortOrder }) => ({
        updateOne: {
          filter: { _id: new mongoose.Types.ObjectId(id) },
          update: { $set: { sortOrder } },
        },
      }));
      await EducationLavel.bulkWrite(bulkUpdateOperations);
      const cacheKey = `education_lavel`;
      await redis.del(cacheKey);
      res.status(200).json({ message: "update successfull" });
    } catch (error) {
      console.log(error);
      res.status(404).send(error);
    }
  }
);
app.post("/digree_add", tokenverify, async (req, res) => {
  try {
    var data = await Digree.findOne({ name: req.body.name });
    if (data == null || data !== null) {
      var digreedata = await Digree({
        name: req.body.name,
        education: req.body.education,
      });
      digreedata.save();
      await EducationLavel.findOneAndUpdate(
        { _id: req.body.education },
        { $push: { digree: digreedata._id } }
      );
      const cacheKey = `admin_digree`;
      await redis.del(cacheKey);
      res.status(200).json({ message: "add successfull" });
    } else {
      res.status(200).json({ message: "all ready added" });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

app.patch("/degree_update/:_id", tokenverify, async (req, res) => {
  try {
    const _id = req.params._id;
    await Digree.findByIdAndUpdate(
      _id,
      {
        $set: {
          name: req.body.name,
        },
      },
      {
        new: true,
      }
    );

    res.status(200).json({ message: "update successfull" });
  } catch (error) {
    res.status(404).send(error);
  }
});

app.post("/subject_add", tokenverify, async (req, res) => {
  // try {
  var data = await Subject.findOne({ name: req.body.name });
  if (data == null || data !== null) {
    var subjectdata = await Subject({
      name: req.body.name,
      digree: req.body.digree,
    });
    await subjectdata.save();
    await Digree.updateMany(
      { _id: { $in: req.body.digree } },
      { $push: { subject: subjectdata._id } }
    );
    res.status(200).json({ message: "add successfull" });
  } else {
    await Digree.updateMany(
      { _id: { $in: req.body.digree } },
      { $addToSet: { subject: data._id } }
    );
    res.status(200).json({ message: "update subject" });
  }
});

// experience insert

app.get("/job_details/:_id", async (req, res) => {
  try {
    var populate = [
      {
        path: "userid",
        populate: [{ path: "companyname" }],
      },
      {
        path: "experience",
        populate: [],
      },
      {
        path: "education",
        populate: [{ path: "digree" }],
      },

      {
        path: "company",
        populate: [
          { path: "c_size" },
          {
            path: "c_location",
            populate: [
              {
                path: "divisiondata",
                populate: ["cityid"],
              },
            ],
          },
        ],
      },
      {
        path: "jobtype",
        populate: [],
      },
      {
        path: "job_location",
        populate: [
          {
            path: "divisiondata",
            populate: ["cityid"],
          },
        ],
      },
      {
        path: "expertice_area",
        populate: [{ path: "industryid" }, { path: "categoryid" }],
      },
      {
        path: "salary",
        populate: [{ path: "min_salary" }, { path: "max_salary" }],
      },
      {
        path: "skill",
        populate: [],
      },
    ];
    var data = await JobPost.findById(req.params._id).populate(populate);
    res.json(data);
  } catch (error) {
    res.send(error);
  }
});

app.post("/experience", tokenverify, async (req, res) => {
  try {
    var experidata = await Experince.findOne({ name: req.body.name });
    if (experidata != null) {
      res.json({ message: "experience allready available" });
    } else {
      await Experince({ name: req.body.name }).save();
      res.json({ message: "experience insert successfull" });
    }
  } catch (error) {
    res.send(error);
  }
});

app.post("/admin_default_skill", tokenverify, async (req, res) => {
  var skilldata = await DefaultSkill.findOne({ skill: req.body.skill });

  if (skilldata == null) {
    var skilldata = await DefaultSkill({ skill: req.body.skill });
    skilldata.save();
    res.status(200).json({ message: "skill add successfull data" });
  } else {
    res.status(400).json({ message: "skill allready added" });
  }
});

app.post("/package", tokenverify, async (req, res) => {
  var data = await Package.findOne({ name: req.body.name });
  if (data == null) {
    await Package({
      name: req.body.name,
      suggestname: req.body.suggestname,
      chat: req.body.chat,
      amount: req.body.amount,
      currency: req.body.currency,
      duration_time: req.body.duration_time,
    }).save();
    res.status(200).json({ message: "add successfull" });
  } else {
    res.status(400).json({ message: "Allready added" });
  }
});

app.get("/package", verifyToken, async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;
    let data = await Package.find().sort("sortOrder");
    const packageData = await PackageBuy.find({
      recruiterid: _id,
      active: true,
    });
    const dataToSend = data.map((element) => {
      let hasMatchingPackage = packageData.some((element1) =>
        element._id.equals(element1.packageid)
      );
      element = element.toObject(); // Convert to plain JavaScript object
      element.isActive = hasMatchingPackage;
      console.log(`ID: ${element._id}, isActive: ${hasMatchingPackage}`);
      return element; // Convert to plain JavaScript object
    });
    res.status(200).send(dataToSend);
  } catch (error) {
    res.status(401).send(error);
  }
});

module.exports = app;
