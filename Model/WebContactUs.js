const { Schema, model } = require("mongoose");

const contactUsSchema = Schema(
  {
    email: String,
    about: String,
  },
  { timestamps: true }
);

module.exports.ContactUs = model("ContactUs", contactUsSchema);
