const { Schema, model } = require("mongoose");

const citySchema = Schema(
  {
    name: String,
    divisionid: [
      {
        type: "ObjectId",
        ref: "Division",
      },
    ],
    sortOrder: Number,
  },
  { timestamps: true }
);

const divisionSchema = Schema(
  {
    divisionname: String,
    cityid: {
      type: "ObjectId",
      ref: "City",
    },
    sortOrder: Number,
  },
  { timestamps: true }
);

var City = model("City", citySchema);
var Division = model("Division", divisionSchema);

module.exports = {
  City,
  Division,
};
