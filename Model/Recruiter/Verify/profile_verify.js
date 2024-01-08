const { Schema, model } = require("mongoose");

const profileverifySchema = Schema(
  {
    type: Number,
    link: String,
    userid: {
      type: "ObjectId",
      ref: "Recruiters_profile",
    },

    fieldname: String,
    originalname: String,
    encoding: String,
    mimetype: String,
    destination: String,
    filename: String,
    path: String,
    size: Number,
  },
  { timestamps: true }
);

var ProfileVerify = model("Profile_Verify", profileverifySchema);

module.exports = {
  ProfileVerify,
};
