const { Schema, model } = require("mongoose");

const workexperienceSchema = Schema(
  {
    companyname: String,
    category: {
      type: "ObjectId",
      ref: "Category_2",
    },
    startdate: Date,
    enddate: Date,
    expertisearea: {
      type: "ObjectID",
      ref: "FunctionalArea",
    },
    designation: String,
    department: String,
    dutiesandresponsibilities: String,
    careermilestones: String,
    workintern: Boolean,
    hidedetails: Boolean,
    userid: {
      type: "ObjectId",
      ref: "User",
    },
  },
  { timestamps: true }
);

const educationlavelSchema = Schema(
  {
    institutename: String,
    digree: {
      type: "ObjectId",
      ref: "digree",
    },
    subject: {
      type: "ObjectId",
      ref: "subject",
    },
    type: Number,
    grade: String,
    gradetype: String,
    division: String,
    startdate: Date,
    enddate: Date,
    otheractivity: String,
    userid: {
      type: "ObjectId",
      ref: "User",
    },
  },
  { timestamps: true }
);

const defaultskillSchema = Schema(
  {
    skill: String,
    userid: {
      type: "ObjectId",
      default: null,
    },
  },
  { timestamps: true }
);
const skillSchema = Schema(
  {
    skill: [{ type: "ObjectId", ref: "default_Skill" }],
    userid: String,
  },
  { timestamps: true }
);
const protfoliolinkSchema = Schema(
  {
    protfoliolink: String,
    userid: {
      type: "ObjectId",
      ref: "User",
    },
  },
  { timestamps: true }
);
const aboutSchema = Schema(
  {
    about: String,
    userid: String,
  },
  { timestamps: true }
);
const careerpreferenceSchema = Schema(
  {
    expectedjobindustry: [
      {
        jobindustry1: {
          type: "ObjectId",
          ref: "industries",
        },
        jobindustry2: {
          type: "ObjectId",
          ref: "industries",
        },
        jobindustry3: {
          type: "ObjectId",
          ref: "industries",
        },
      },
    ],
    expertisearea: String,
    expectedjoblocation: String,
    jobtype: {
      type: "ObjectId",
      ref: "Jobtype",
    },
    expectedsalary: {
      type: "ObjectId",
      ref: "Salirietype",
    },
    userid: String,
  },
  { timestamps: true }
);

const allprofiledataSchema = Schema(
  {
    userid: {
      type: "ObjectID",
      ref: "User",
    },
    workexperience: [
      {
        type: "ObjectId",
        ref: "Workexperience",
      },
    ],
    education: [
      {
        type: "ObjectId",
        ref: "Education",
      },
    ],
    skill: [
      {
        type: String,
      },
    ],
    protfoliolink: [
      {
        type: "ObjectId",
        ref: "Protfoliolink",
      },
    ],
    about: {
      type: "ObjectId",
      ref: "About",
    },
    careerPreference: [
      {
        type: "ObjectId",
        ref: "career_preferences",
      },
    ],
  },
  { timestamps: true }
);

var Workexperience = model("Workexperience", workexperienceSchema);

var Education = model("Education", educationlavelSchema);

var DefaultSkill = model("default_Skill", defaultskillSchema);
var Skill = model("Skill", skillSchema);

var Protfoliolink = model("Protfoliolink", protfoliolinkSchema);

var About = model("About", aboutSchema);

var CareerPreference = model("CareerPreference", careerpreferenceSchema);

var Profiledata = model("seeker_profiledata", allprofiledataSchema);

module.exports = {
  Workexperience,
  Education,
  DefaultSkill,
  Skill,
  Protfoliolink,
  About,
  CareerPreference,
  Profiledata,
};
