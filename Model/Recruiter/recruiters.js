const { Schema, model } = require("mongoose");
const jwt = require("jsonwebtoken");

const recruitersSchema = Schema(
  {
    number: {
      type: String,
      required: true,
    },
    firstname: String,
    lastname: String,
    companyname: {
      type: "ObjectId",
      ref: "Company",
    },
    designation: String,
    email: String,
    image: String,
    other: {
      totaljob: {
        type: Number,
        default: 0,
      },
      package: {
        type: "ObjectId",
        ref: "Packages_buy",
        default: null,
      },
      latestjobid: {
        type: "ObjectId",
        ref: "job_post",
        default: null,
      },
      company_verify: {
        type: Boolean,
        default: true,
      },
      manually_company_verify: {
        type: Boolean,
        default: true,
      },
      profile_verify: {
        type: Boolean,
        default: false,
      },
      profile_verify_type: {
        type: Number,
        default: 0,
      },
      company_verify_type: {
        type: Number,
        default: 1,
      },
      company_docupload: {
        type: Boolean,
        default: true,
      },
      profile_docupload: {
        type: Boolean,
        default: false,
      },
      profile_other_docupload: {
        type: Boolean,
        default: false,
      },
      profile_verify_date: {
        type: Date,
        default: new Date(),
      },
      premium: {
        type: Boolean,
        default: false,
      },
      total_chat: {
        type: Number,
        default: 0,
      },
      savecandidate: {
        type: Number,
        default: 0,
      },
      interview: {
        type: Number,
        default: 0,
      },
      candidate_view: {
        type: Number,
        default: 0,
      },
      total_step: { type: Number, default: 6 },
      incomplete: { type: Number, default: 1 },
      complete: { type: Number, default: 5 },
      online: { type: Boolean, default: false },
      offlinedate: {
        type: Number,
        default: new Date().getTime(),
      },
      pushnotification: String,
      notification: {
        push_notification: {
          type: Boolean,
          default: true,
        },
        whatsapp_notification: {
          type: Boolean,
          default: false,
        },
        sms_notification: {
          type: Boolean,
          default: false,
        },
        job_recommandation: {
          type: Boolean,
          default: true,
        },
      },
    },
  },
  { timestamps: true }
);

recruitersSchema.methods.generateJWT = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      number: this.number,
    },
    process.env.ACCESS_TOKEN,
    { expiresIn: "1y" }
  );
  return token;
};

var recruiters = model("Recruiters_profile", recruitersSchema);

module.exports = recruiters;
