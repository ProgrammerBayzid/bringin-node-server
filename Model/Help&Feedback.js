const { Schema, model } = require("mongoose");

const helpAndFeedbackSchema = Schema(
  {
    userid: {
      type: "ObjectId",
      ref: "User",
    },
    about: String,
    image: String,
  },
  { timestamps: true }
);

module.exports.HelpFeedback = model("HelpFeedback", helpAndFeedbackSchema);
