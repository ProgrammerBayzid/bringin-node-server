const express = require("express");
const app = express();
const axios = require("axios");
const {
  Expertisearea,
  Category,
  Functionarea,
} = require("../../Model/industry.js");
const { Profiledata } = require("../../Model/Seeker_profile_all_details.js");

const { ContactUs } = require("../../Model/WebContactUs.js");
const tokenverify = require("../../MiddleWare/tokenverify.js");
const jwt = require("jsonwebtoken");

const multer = require("multer");
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

const { City, Division } = require("../../Model/alllocation.js");

const Experince = require("../../Model/experience.js");

app.get("/web_contact", async (req, res) => {
  try {
    var data = await ContactUs.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post("/web_contact", async (req, res) => {
  try {
    const contact = await ContactUs({
      email: req.body.email,
      about: req.body.about,
    }).save();
    res.json({ message: "Contact us add successfull" });
  } catch (error) {
    res.send(error);
  }
});

app.delete("/web_contact/:id", async (req, res) => {
  try {
    const result = await ContactUs.findByIdAndDelete(req.params.id);
    if (!req.params.id) {
      return res.status(404).send();
    }
    res.send(result);
  } catch (error) {
    res.send(error);
  }
});

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

app.get("/job_functionalarea/:industryname", async (req, res) => {
  try {
    // Use the 'findOne' method with the appropriate query.
    const industry = await Expertisearea.findOne({
      industryname: req.params.industryname,
    }).populate({
      path: "category",
      populate: { path: "functionarea" },
    });

    if (!industry) {
      return res.status(404).json({ error: "Industry not found" });
    }

    res.status(200).json(industry);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/expertisearea/:categoryname", async (req, res) => {
  try {
    var data = await Category.findOne({
      categoryname: req.params.categoryname,
    }).populate(["industryid", "functionarea"]);
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

app.get("/single_profile/:_id", async (req, res) => {
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
    if (element.functionalarea.functionalname == req.query.functionalname) {
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
app.get("/candidatelist_devision_clint", async (req, res) => {
  function devisionfilter(element) {
    if (element.division.cityid.name == req.query.name) {
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
        var filterdata2 = filterdata.careerPreference.filter(devisionfilter);
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

app.get("/candidates", async (req, res) => {
  try {
    const { skill, division } = req.query;

    if (!skill && !division) {
      return res.status(400).json({
        error:
          "Please provide at least one search parameter (skill or division).",
      });
    }

    let candidates = [];

    if (skill) {
      const candidatesBySkill = await searchCandidatesBySkill(skill);
      candidates = candidates.concat(candidatesBySkill);
    }

    if (division) {
      const candidatesByDivision = await searchCandidatesByDivision(division);
      candidates = candidates.concat(candidatesByDivision);
    }

    res.status(200).json(candidates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

async function searchCandidatesBySkill(skill) {
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

  const candidates = await Profiledata.find()
    .populate(populate2)
    .then((data) => {
      return data.filter((candidate) => {
        const matchingFunctionalAreas = candidate.careerPreference.filter(
          (preference) => {
            return preference.functionalarea.functionalname.toLowerCase() === skill.toLowerCase();
          }
        );

        return matchingFunctionalAreas.length > 0;
      });
    });

  return candidates;
}

async function searchCandidatesByDivision(division) {
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

  const candidates = await Profiledata.find()
    .populate(populate2)
    .then((data) => {
      return data.filter((candidate) => {
        const matchingDivisions = candidate.careerPreference.filter(
          (preference) => {
            return preference.division.cityid.name.toLowerCase() === division.toLowerCase();
          }
        );

        return matchingDivisions.length > 0;
      });
    });

  return candidates;
}

app.get("/candidates_search_v2", async (req, res) => {
  try {
    const { skill, division } = req.query;
    const limit = parseInt(req.query.limit) || 30; // Default limit to 10 if not provided
    const page = parseInt(req.query.page) || 1; // Default page to 1 if not provided
    if (!skill && !division) {
      return res.status(400).json({
        error:
          "Please provide at least one search parameter (skill or division).",
      });
    }

    let candidates = [];

    if (skill && division) {
      const candidatesBySkillAndDivision =
        await searchCandidatesBySkillAndDivision(skill, division);
      candidates = candidates.concat(candidatesBySkillAndDivision);
    } else if (skill) {
      const candidatesBySkill = await searchCandidatesBySkill(skill);
      candidates = candidates.concat(candidatesBySkill);
    } else if (division) {
      const candidatesByDivision = await searchCandidatesByDivision(division);
      candidates = candidates.concat(candidatesByDivision);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedCandidates = candidates.slice(startIndex, endIndex);

    res.status(200).json(paginatedCandidates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Modify searchCandidatesBySkill to accept division as well
async function searchCandidatesBySkillAndDivision(skill, division) {
  // ... Your existing populate2 configuration ...
  console.log("Search skill:", skill);
  console.log("Search division:", division);
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
  const candidates = await Profiledata.find()
    .populate(populate2)
    .then((data) => {
      return data.filter((candidate) => {
        const matchingFunctionalAreas = candidate.careerPreference.filter(
          (preference) => {
            return (
              preference.functionalarea.functionalname.toLowerCase() === skill.toLowerCase() &&
              preference.division.cityid.name.toLowerCase() === division.toLowerCase()
            );
          }
        );

        return matchingFunctionalAreas.length > 0;
      });
    });

  return candidates;
}

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
          var filterdata2 = filterdata.careerPreference.filter(industryfilter);
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

// app.listen(3000, () => {
//   console.log("Server is running on port 3000");
// });

module.exports = app;
