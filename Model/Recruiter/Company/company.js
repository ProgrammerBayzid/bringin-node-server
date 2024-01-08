const { Schema, model } = require("mongoose");

const companySchema = Schema(
  {
    userid: String,
    legal_name: String,
    sort_name: String,
    industry: {
      type: "ObjectId",
      ref: "Category_2",
    },
    c_size: {
      type: "ObjectId",
      ref: "Company_Size",
    },
    c_location: {
      lat: Schema.Types.Mixed,
      lon: Schema.Types.Mixed,
      formet_address: String,
      locationoptional: String,
      divisiondata: {
        type: "ObjectId",
        ref: "Division",
        default: "64aa36d31932a2e4a09a79ed",
      },
    },
    c_website: String,
  },
  { timestamps: true }
);

const companysizeSchema = Schema(
  {
    size: String,
    sortOrder: Number,
  },
  { timestamps: true }
);

var Companysize = model("Company_Size", companysizeSchema);

var Company = model("Company", companySchema);

module.exports = {
  Company,
  Companysize,
};
