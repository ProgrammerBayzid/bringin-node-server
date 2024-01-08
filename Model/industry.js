const { Schema, model } = require("mongoose");

const industrySchema = Schema(
  {
    industryname: String,
    category: [
      {
        type: "ObjectId",
        ref: "Category",
      },
    ],
    sortOrder: Number,
  },
  { timestamps: true }
);
const industry2Schema = Schema(
  {
    industryname: String,
    category: [
      {
        type: "ObjectId",
        ref: "Category_2",
      },
    ],
    sortOrder: Number,
  },
  { timestamps: true }
);

const categorySchema = Schema(
  {
    industryid: {
      type: "ObjectId",
      ref: "industries",
    },
    categoryname: String,
    functionarea: [
      {
        type: "ObjectId",
        ref: "FunctionalArea",
      },
    ],
    sortOrder: Number,
  },
  { timestamps: true }
);

const category2Schema = Schema(
  {
    industryid: {
      type: "ObjectId",
      ref: "industries_2",
    },
    categoryname: String,
    sortOrder: Number,
  },
  { timestamps: true }
);

const functionalareaSchema = Schema(
  {
    industryid: {
      type: "ObjectId",
      ref: "industries",
    },

    categoryid: {
      type: "ObjectId",
      ref: "Category",
    },
    functionalname: String,
    sortOrder: Number,
  },
  { timestamps: true }
);

var Functionarea = model("FunctionalArea", functionalareaSchema);

var Category = model("Category", categorySchema);
var Category2 = model("Category_2", category2Schema);

var Expertisearea = model("industries", industrySchema);
var Expertisearea2 = model("industries_2", industry2Schema);

module.exports = {
  Expertisearea,
  Category,
  Functionarea,
  Category2,
  Expertisearea2,
};
