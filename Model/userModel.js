const { Schema, model } = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = Schema(
  {
    number: {
      type: String,
      required: true,
    },
    secoundnumber: {
      type: String,
      default: null,
    },
    fastname: {
      type: String,
      default: "",
    },
    lastname: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      default: "",
    },
    experiencedlevel: {
      type: "ObjectId",
      ref: "Experience",
    },
    startedworking: {
      type: Date,
      default: new Date(),
    },
    deatofbirth: {
      type: Date,
      default: null,
    },
    other: {
      viewjob: { type: Number, default: 0 },
      cvsend: { type: Number, default: 0 },
      totalchat: { type: Number, default: 0 },
      savejob: { type: Number, default: 0 },
      carearpre: { type: Number, default: 0 },
      total_step: { type: Number, default: 7 },
      incomplete: { type: Number, default: 5 },
      complete: { type: Number, default: 2 },
      online: { type: Boolean, default: false },
      offlinedate: {
        type: Number,
        default: new Date().getTime(),
      },
      lastfunctionalarea: {
        type: "ObjectId",
        ref: "FunctionalArea",
        default: "64a2d832e19e64570285c57b",
      },
      pushnotification: String,
      full_profile: {
        type: "ObjectId",
        ref: "seeker_profiledata",
        default: null,
      },
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
      job_hunting: {
        type: String,
        default: null,
      },
      more_status: {
        type: String,
        default: null,
      },
      job_right_now: {
        type: Boolean,
        default: false,
      },
    },
    email: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.methods.generateJWT = function () {
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

var User = model("User", userSchema);

module.exports = User;
