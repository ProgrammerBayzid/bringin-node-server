const { Schema, model } = require("mongoose");

const career_preferencesSchema = Schema(
  {
    userid: {
      type: "ObjectId",
      ref: "User",
    },
    category: [
      {
        type: "ObjectId",
        ref: "Category_2",
      },
    ],
    functionalarea: {
      type: "ObjectId",
      ref: "FunctionalArea",
    },
    division: {
      type: "ObjectId",
      ref: "Division",
    },
    jobtype: {
      type: "ObjectId",
      ref: "Jobtype",
    },
    salaray: {
      min_salary: {
        type: "ObjectId",
        ref: "Salary",
      },
      max_salary: {
        type: "ObjectId",
        ref: "Salary",
      },
    },
  },
  { timestamps: true }
);

var Career_preferences = model("career_preferences", career_preferencesSchema);

module.exports = Career_preferences;
