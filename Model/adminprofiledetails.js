const { Schema, model } = require("mongoose");

const jobtitleSchema = Schema({
  name: String,
});
const departmentSchema = Schema({
  name: String,
});

const seekercompanyaddSchema = Schema({
  name: String,
});

const imageSchema = Schema({
  image: String,
});

const cvSchema = Schema({
  cv: String,
});

const adminskillSchema = Schema({
  name: String,
});

const companySizrSchema = Schema({
  min: String,
  max: String,
});

var JobTitle = model("JobTitle", jobtitleSchema);

var Department = model("Department", departmentSchema);

var SeekeraddCompany = model("SeekerCompany", seekercompanyaddSchema);

var Image = model("Image", imageSchema);

var Cv = model("Cv", cvSchema);

var AdminSkill = model("AdminSkill", adminskillSchema);

var AdminCompanySize = model("AdminCompanySize", companySizrSchema);

module.exports = {
  AdminCompanySize,
  AdminSkill,
  JobTitle,
  Department,
  SeekeraddCompany,
  Image,
  Cv,
};
