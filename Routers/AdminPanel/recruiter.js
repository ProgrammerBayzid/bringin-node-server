const express = require("express");
const app = express();
const Recruiters = require("../../Model/Recruiter/recruiters");
const candidatesave = require("../../Model/Recruiter/Candidate_Save/candidate_save");
const {
  Chat,
  Message,
  Chatreport,
  CandidateReject,
  ChatFeedBack,
} = require("../../Model/Chat/chat");
const ViewJob = require("../../Model/viewjob");
const JobPost = require("../../Model/Recruiter/Job_Post/job_post.js");
const CandidateReport = require("../../Model/Recruiter/Candidate_Report/candidate_report");
const CandidateView = require("../../Model/Recruiter/Candidate_View/candidate_view");
const ChatStore = require("../../Model/Chat/chat_store");
const {
  CompanyVerify,
} = require("../../Model/Recruiter/Verify/company_verify.js");
const { Company } = require("../../Model/Recruiter/Company/company");
const CvSnedStore = require("../../Model/cv_send_store");
const JobReport = require("../../Model/job_report");
const JobSave = require("../../Model/jobsave");
const Packagebuy = require("../../Model/Package/package_buy.js");
const {
  ProfileVerify,
} = require("../../Model/Recruiter/Verify/profile_verify");
const Recruiterfunction = require("../../Model/Recruiter/Recruiter_Functionarea/recruiter_functionarea");
const { HelpFeedback } = require("../../Model/Help&Feedback");
const { Resume } = require("../../Model/resumefile");
const {
  Workexperience,
  Education,
  DefaultSkill,
  Skill,
  Protfoliolink,
  About,
  CareerPreference,
  Profiledata,
} = require("../../Model/Seeker_profile_all_details");
const User = require("../../Model/userModel");
const tokenverify = require("../../MiddleWare/tokenverify.js");
const jwt = require("jsonwebtoken");

app.delete("/recruiter_delete", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;
    var id = _id;
    await CandidateReject.deleteMany({ userid: id });
    await CandidateReport.deleteMany({ userid: id });
    await candidatesave.deleteMany({ userid: id });
    await CandidateView.deleteMany({ userid: id });
    await Chat.deleteMany({ recruiterid: id });
    await Chatreport.deleteMany({ recruiterid: id });
    await ChatStore.deleteMany({ recruiterid: id });
    await ChatFeedBack.deleteMany({ recruiterid: id });
    await CompanyVerify.deleteMany({ userid: id });
    await Company.deleteMany({ userid: id });
    await CvSnedStore.deleteMany({ recruiterid: id });
    await JobPost.deleteMany({ userid: id });
    await JobReport.deleteMany({ jobpostuserid: id });
    await JobSave.deleteMany({ jobpostuserid: id });
    await Packagebuy.deleteMany({ recruiterid: id });
    await ProfileVerify.deleteMany({ userid: id });
    await Recruiterfunction.deleteMany({ userid: id });
    await Recruiters.deleteMany({ _id: id });
    await ViewJob.deleteMany({ jobpost_userid: id });
    res.status(200).json({ message: "all data remove this recruiter" });
  } catch (error) {
    console.error("An error occurred:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the request" });
  }
});

app.delete("/recruiter_deletes/:_id", async (req, res) => {
  const recruiterId = req.params._id;

  try {
    await CandidateReject.deleteMany({ userid: recruiterId });
    await CandidateReport.deleteMany({ userid: recruiterId });
    await candidatesave.deleteMany({ userid: recruiterId });
    await CandidateView.deleteMany({ userid: recruiterId });
    await Chat.deleteMany({ recruiterid: recruiterId });
    await Chatreport.deleteMany({ recruiterid: recruiterId });
    await ChatStore.deleteMany({ recruiterid: recruiterId });
    await ChatFeedBack.deleteMany({ recruiterid: recruiterId });
    await CompanyVerify.deleteMany({ userid: recruiterId });
    await Company.deleteMany({ userid: recruiterId });
    await CvSnedStore.deleteMany({ recruiterid: recruiterId });
    await JobPost.deleteMany({ userid: recruiterId });
    await JobReport.deleteMany({ jobpostuserid: recruiterId });
    await JobSave.deleteMany({ jobpostuserid: recruiterId });
    await Packagebuy.deleteMany({ recruiterid: recruiterId });
    await ProfileVerify.deleteMany({ userid: recruiterId });
    await Recruiterfunction.deleteMany({ userid: recruiterId });
    await Recruiters.deleteMany({ _id: recruiterId });
    await ViewJob.deleteMany({ jobpost_userid: recruiterId });

    res
      .status(200)
      .json({ message: "All data for this recruiter has been removed" });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while deleting data" });
  }
});

app.delete("/seeker_delete", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;
    var id = _id;
    await About.deleteMany({ userid: id });
    await CandidateReject.deleteMany({ candidateid: id });
    await CandidateReport.deleteMany({ candidateid: id });
    await candidatesave.deleteMany({ candidateid: id });
    await CandidateView.deleteMany({ candidate_id: id });
    await CareerPreference.deleteMany({ userid: id });
    await Chat.deleteMany({ seekerid: id });
    await Chatreport.deleteMany({ seekerid: id });
    await ChatStore.deleteMany({ seekerid: id });
    await ChatFeedBack.deleteMany({ userid: id });
    await CvSnedStore.deleteMany({ userid: id });
    await Education.deleteMany({ userid: id });
    await HelpFeedback.deleteMany({ userid: id });
    await JobReport.deleteMany({ userid: id });
    await JobSave.deleteMany({ userid: id });
    await Protfoliolink.deleteMany({ userid: id });
    await Resume.deleteMany({ userid: id });
    await Profiledata.deleteMany({ userid: id });
    await Skill.deleteMany({ userid: id });
    await User.deleteMany({ _id: id });
    await ViewJob.deleteMany({ userid: id });
    await Workexperience.deleteMany({ userid: id });
    res.status(200).json({ message: "all data removed for this seeker" });
  } catch (error) {
    console.error("An error occurred:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the request" });
  }
});

app.delete("/seeker_deletes/:_id", async (req, res) => {
  try {
    const seekerId = req.params._id; // Use consistent parameter name

    await About.deleteMany({ userid: seekerId });
    await CandidateReject.deleteMany({ candidateid: seekerId });
    await CandidateReport.deleteMany({ candidateid: seekerId });
    await candidatesave.deleteMany({ candidateid: seekerId });
    await CandidateView.deleteMany({ candidate_id: seekerId });
    await CareerPreference.deleteMany({ userid: seekerId });
    await Chat.deleteMany({ seekerid: seekerId });
    await Chatreport.deleteMany({ seekerid: seekerId });
    await ChatStore.deleteMany({ seekerid: seekerId });
    await ChatFeedBack.deleteMany({ userid: seekerId });
    await CvSnedStore.deleteMany({ userid: seekerId });
    await Education.deleteMany({ userid: seekerId });
    await HelpFeedback.deleteMany({ userid: seekerId });
    await JobReport.deleteMany({ userid: seekerId });
    await JobSave.deleteMany({ userid: seekerId });
    await Protfoliolink.deleteMany({ userid: seekerId });
    await Resume.deleteMany({ userid: seekerId });
    await Profiledata.deleteMany({ userid: seekerId });
    await Skill.deleteMany({ userid: seekerId });
    await User.deleteMany({ _id: seekerId });
    await ViewJob.deleteMany({ userid: seekerId });
    await Workexperience.deleteMany({ userid: seekerId });

    res.status(200).json({ message: "All data removed for this seeker" });
  } catch (error) {
    console.error("An error occurred:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the request" });
  }
});

module.exports = app;
