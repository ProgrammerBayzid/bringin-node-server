const express = require("express");
const app = express();
const axios = require("axios");
const {
  Expertisearea,
  Category,
  Functionarea,
} = require("../../Model/industry.js");
const { Profiledata } = require("../../Model/Seeker_profile_all_details.js");
const Recruiters = require("../../Model/Recruiter/recruiters");
const tokenverify = require("../../MiddleWare/tokenverify.js");
const jwt = require("jsonwebtoken");

const { City, Division } = require("../../Model/alllocation.js");

const Experince = require("../../Model/experience.js");

app.get("/job_functionalarea/clint", async (req, res) => {
  try {
    var industry = await Expertisearea.find().populate([
      { path: "category", populate: { path: "functionarea" } },
    ]);
    res.status(200).send(industry);
  } catch (error) {
    res.status(404).send(error);
  }
});

app.get("/job_functionalarea/:_id", async (req, res) => {
  try {
    var industry = await Expertisearea.findById(req.params._id).populate([
      { path: "category", populate: { path: "functionarea" } },
    ]);
    res.status(200).send(industry);
  } catch (error) {
    res.status(404).send(error);
  }
});

app.get("/expertisearea/:_id", async (req, res) => {
  try {
    var data = await Category.findById(req.params._id).populate([
      "industryid",
      "functionarea",
    ]);
    res.status(200).json(data);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/functionalarea/:_id", async (req, res) => {
  try {
    var data = await Functionarea.findById(req.params._id).populate([
      "industryid",
      "categoryid",
    ]);
    res.json(data);
  } catch (error) {
    res.send(error);
  }
});

app.get("/clint_single_profile/:_id", async (req, res) => {
  try {
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
    ];
    var data = await Profiledata.findById(req.params._id).populate(populate);
    res.json(data);
  } catch (error) {
    res.send(error);
  }
});

app.get("/candidatelist_clint", async (req, res) => {
  function functionalareafilter(element) {
    if (element.functionalarea._id == req.query.functionalareaid) {
      return true;
    } else {
      return false;
    }
  }
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
  var seekerdata = await Profiledata.find()
    .populate(populate2)
    .then((data) =>
      data.filter((filterdata) => {
        var filterdata2 =
          filterdata.careerPreference.filter(functionalareafilter);
        if (filterdata2.length > 0) {
          return true;
        } else {
          return false;
        }
      })
    );
  res.status(200).send(seekerdata);

  // res.status(400).send(error);
});

app.get("/clint_candidate_search", async (req, res) => {
  try {
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
        "skill",
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
            "salaray",
          ],
        },

        {
          path: "careerPreference",
          populate: [
            {
              path: "functionalarea",
              match: {
                functionalname: { $regex: req.query.name, $options: "i" },
              },
            },
          ],
        },
        { path: "userid", populate: { path: "experiencedlevel" } },
      ])
      .then((data) => data.filter((filterdata) => filterdata.userid != null));
    res.status(200).send(seekerdata);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post("/candidate_filter", tokenverify, async (req, res) => {
  try {
    jwt.verify(req.token, process.env.ACCESS_TOKEN, async (err, authdata) => {
      if (err) {
        res.json({ message: "invalid token" });
      } else {
        const _id = authdata._id;
        var workplace = req.body.workplace;
        var education = req.body.education;
        var salary = req.body.salary;
        var experience = req.body.experience;
        var industry = req.body.industry;
        var companysize = req.body.companysize;
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
          "skill",
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
              "salaray",
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
          if (
            industry.some((e) => element.functionalarea.industryid == e) &&
            salary.some((e) => element.salaray._id == e)
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
              var filterdata2 =
                filterdata.careerPreference.filter(industryfilter);
              var educationdata2 = filterdata.education.filter(educationfilter);

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
      }
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post("/app_link", async (req, res) => {
  const number = req.body.number;
  axios
    .post(
      `http://bulksmsbd.net/api/smsapi?api_key=${process.env.SMS_KEY}&type=text&number=${number}&senderid=8809617611096&message=Bringin+App+Link+is+https://play.google.com/store/apps/details?id=com.bringin.io`
    )
    .then((response) => {
      console.log(response.data);
    });

  return res.status(200).json({ message: "App Link Sent Successfully" });
});

module.exports = app;
