const { Schema, model } = require("mongoose");

const experienceSchema = Schema(
  {
    name: String,
    sortOrder: Number,
  },
  { timestamps: true }
);

var experience = model("Experience", experienceSchema);

module.exports = experience;
