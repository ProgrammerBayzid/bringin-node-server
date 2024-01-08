const { Schema, model } = require("mongoose");

const chatSchema = Schema(
  {
    who_view_me: {
      title: String,
      totalview: {
        type: Number,
        default: 0,
      },
      newview: {
        type: Number,
        default: 0,
      },
      seekerviewid: {
        type: "ObjectId",
        ref: "Recruiters_profile",
      },
      recruiterview: {
        type: "ObjectId",
        ref: "User",
      },
    },
    not_interest: {
      title: String,
      person: {
        type: Number,
        default: 0,
      },
    },
    recruiter_reject: {
      type: Boolean,
      default: false,
    },
    type: {
      type: Number,
      default: 1,
    },
    seekerid: {
      type: "ObjectId",
      ref: "User",
    },
    recruiterid: {
      type: "ObjectId",
      ref: "Recruiters_profile",
    },
    date: Date,
    greating: {
      type: Number,
      default: 0,
    },
    bring_assis: {
      title: String,
      message1: String,
      message2: String,
      bringlastmessage: {
        type: "ObjectId",
        ref: "messagelist",
      },
    },
    recruiter_unseen: {
      type: Number,
      default: 0,
    },
    seeker_unseen: {
      type: Number,
      default: 0,
    },
    lastmessage: {
      type: "ObjectId",
      ref: "messagelist",
    },
    recruitermsgdate: {
      type: Date,
      default: null,
    },
    currentdate: {
      type: Date,
    },
    seekerblock: {
      type: Boolean,
      default: false,
    },
    recruiterblock: {
      type: Boolean,
      default: false,
    },
    jobid: {
      type: "ObjectId",
      default: null,
      ref: "job_post",
    },
    candidate_fullprofile: {
      type: "ObjectId",
      default: null,
      ref: "seeker_profiledata",
    },
    outbound: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const messageSchema = Schema(
  {
    channel: {
      type: "ObjectId",
      ref: "Chat_channel",
    },
    message: {},
  },
  { timestamps: true }
);

const chatreportSchema = Schema(
  {
    userid: "ObjectId",
    channel: {
      type: "ObjectId",
      ref: "Chat_channel",
    },
    seekerid: {
      type: "ObjectId",
      ref: "User",
    },
    recruiterid: {
      type: "ObjectId",
      ref: "Recruiters_profile",
    },
    image: [
      {
        type: String,
      },
    ],
    discription: String,
    report: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

const candidaterejectSchema = Schema(
  {
    userid: "ObjectId",
    candidateid: {
      type: "ObjectId",
      ref: "User",
    },
    candidatefullprofileid: {
      type: "ObjectId",
      ref: "seeker_profiledata",
    },
  },
  { timestamps: true }
);

const chatFeedbackSchema = Schema(
  {
    userid: {
      type: "ObjectId",
      ref: "User",
    },
    recruiterid: {
      type: "ObjectId",
      ref: "Recruiters_profile",
    },
    text: String,
    image: String,
    channel: "ObjectId",
  },
  { timestamps: true }
);

// var Chat = model("Chat_channel", chatSchema);
// var Message = model("messagelist", messageSchema);
// var Chatreport = model("chat_report", chatreportSchema);
// var CandidateReject = model("candidate_reject", candidaterejectSchema);
// var ChatFeedBack = model("chatFeedbackSchema", chatFeedbackSchema);

var Chat = model("Chat_channel", chatSchema);
var Message = model("messagelist", messageSchema);
var Chatreport = model("chat_report", chatreportSchema);
var CandidateReject = model("candidate_reject", candidaterejectSchema);
var ChatFeedBack = model("chatFeedback", chatFeedbackSchema);

module.exports = { Chat, Message, Chatreport, CandidateReject, ChatFeedBack };
