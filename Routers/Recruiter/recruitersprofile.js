const express = require("express");
const app = express();
const Recruiters = require("../../Model/Recruiter/recruiters");
const tokenverify = require("../../MiddleWare/tokenverify.js");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const candidatesave = require("../../Model/Recruiter/Candidate_Save/candidate_save");
const { Chat, Message } = require("../../Model/Chat/chat");
const ViewJob = require("../../Model/viewjob");
const JobPost = require("../../Model/Recruiter/Job_Post/job_post.js");
const {
  bring_assistent_RecruterprofileNotComplite__notify_send,
  bring_assistent_RecruterprofileNotVerify__notify_send,
  createAssistant,
  recruterProfileNotverifyMassagesend,
} = require("../Notification/notification");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

// recruiters get

async function recruiternumberupdate(_id) {
  var candidate = await candidatesave.find({ userid: _id });
  var chat = await Chat.find({
    recruiterid: _id,
    type: 1,
    recruitermsgdate: { $ne: null },
  });
  var viewjob = await ViewJob.find({ jobpost_userid: _id });
  var totaljob = await JobPost.find({ userid: _id });
  await Recruiters.findOneAndUpdate(
    { _id: _id },
    {
      $set: {
        "other.total_chat": chat.length,
        "other.savecandidate": candidate.length,
        "other.totaljob": totaljob.length,
        "other.latestjobid":
          totaljob.length > 0 ? totaljob[totaljob.length - 1]._id : null,
      },
    }
  );
  // console.log(viewjob.length)
  // await Chat.findOneAndUpdate({recruiterid: _id, type: 3},{$set: {"who_view_me.totalview": viewjob.length}})
}

app.get("/recruiters_profile", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;
    const singalRecruiter = await Recruiters.findOne({ _id: _id }).populate([
      {
        path: "companyname",
        populate: [
          {
            path: "industry",
            select: "categoryname",
          },
          {
            path: "c_location.divisiondata",
            populate: { path: "cityid", select: "name" },
          },
        ],
      },
      { path: "other.package", populate: { path: "packageid" } },
    ]);
    Promise.all([recruiternumberupdate(_id)]);
    res.status(200).send(singalRecruiter);
  } catch (error) {
    res.status(400).send(error);
  }
});

//   // # update user data

app.post(
  "/recruiters_update",
  tokenverify,
  upload.single("image"),
  async (req, res) => {
    try {
      const token = req.token;
      const _id = req.userId;
      if (req.file) {
        console.log(req.file.path);
        await Recruiters.findOneAndUpdate(
          { _id: _id },
          {
            $set: {
              image: req.file.path,
              "other.incomplete": 0,
              "other.complete": 6,
            },
          }
        );
      }
      const updateRecruiter = await Recruiters.findOneAndUpdate(
        { _id: _id },
        {
          $set: {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            designation: req.body.designation,
            email: req.body.email,
          },
        },
        {
          new: true,
        }
      );

      res.status(200).json({ message: "Photo updated successfully" });
    } catch (error) {
      res.status(404).send(error);
    }
  }
);
app.post(
  "/adminPanel_recruiters_update/:_id",
  tokenverify,
  upload.single("image"),
  async (req, res) => {
    try {
      const _id = req.params._id;
      if (req.file) {
        console.log(req.file.path);
        await Recruiters.findOneAndUpdate(
          { _id: _id },
          {
            $set: {
              image: req.file.path,
              "other.incomplete": 0,
              "other.complete": 6,
            },
          }
        );
      }
      const updateRecruiter = await Recruiters.findOneAndUpdate(
        { _id: _id },
        {
          $set: {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            designation: req.body.designation,
            email: req.body.email,
          },
        },
        {
          new: true,
        }
      );

      res.status(200).json({ message: "Photo updated successfully" });
    } catch (error) {
      res.status(404).send(error);
    }
  }
);

app.get("/clint_recruiters_profile/:_id", async (req, res) => {
  try {
    const _id = req.params._id;
    const singalRecruiter = await Recruiters.findById(_id).populate([
      {
        path: "companyname",
        populate: [
          {
            path: "industry",
            populate: "industryid",
            // select: "industryname",
          },
          "c_size",
          {
            path: "c_location.divisiondata",
            populate: { path: "cityid", select: "name" },
          },
        ],
      },
      { path: "other.package", populate: { path: "packageid" } },
      {
        path: "other",
        populate: {
          path: "latestjobid",
          populate: [
            "jobtype",
            "experience",
            "education",
            "salary.min_salary",
            "salary.max_salary",
          ],
        },
      },
    ]);
    Promise.all([recruiternumberupdate(_id)]);
    res.status(200).send(singalRecruiter);
  } catch (error) {
    res.status(400).send(error);
  }
});

// recruter send message when profile not complite and verify

app.get("/profile_not_complete_recruter", async (req, res) => {
  try {
    const incompleteProfiles = await Recruiters.aggregate([
      {
        $lookup: {
          from: "companies",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$userid", "$$userId"] },
              },
            },
          ],
          as: "companyname",
        },
      },
      {
        $project: {
          _id: 1,
          firstname: 1,
          lastname: 1,
          designation: 1,
          email: 1,
          image: 1,
          incompleteCollections: {
            companyname: { $eq: ["$companyname", []] },
          },
        },
      },
      {
        $project: {
          _id: 1,
          firstname: 1,
          lastname: 1,
          designation: 1,
          email: 1,
          image: 1,
          incompleteCollections: {
            companyname: { $eq: ["$companyname", []] },
          },
          completionPercentage: {
            $multiply: [
              {
                $divide: [
                  {
                    $add: [
                      {
                        $cond: {
                          if: { $eq: ["$firstname", null] },
                          then: 0,
                          else: 1,
                        },
                      },
                      {
                        $cond: {
                          if: { $eq: ["$lastname", null] },
                          then: 0,
                          else: 1,
                        },
                      },
                      {
                        $cond: {
                          if: { $eq: ["$designation", null] },
                          then: 0,
                          else: 1,
                        },
                      },
                      {
                        $cond: {
                          if: { $eq: ["$email", null] },
                          then: 0,
                          else: 1,
                        },
                      },
                      {
                        $cond: {
                          if: { $eq: ["$image", null] },
                          then: 0,
                          else: 1,
                        },
                      },

                      {
                        $cond: {
                          if: {
                            $eq: ["$incompleteCollections.companyname", true],
                          },
                          then: 0,
                          else: 1,
                        },
                      },
                    ],
                  },
                  6, // total number of fields considered
                ],
              },
              100, // multiply by 100 to get percentage
            ],
          },
        },
      },
      {
        $match: {
          $or: [
            { "incompleteCollections.companyname": true },
            { firstname: null },
            { lastname: null },
            { designation: null },
            { email: null },
            { image: null },
          ],
        },
      },
    ]);

    const allColloctionIncompleteProfiles = incompleteProfiles.filter(
      (profile) =>
        profile.incompleteCollections.companyname === true ||
        profile.firstname === null ||
        profile.lastname === null ||
        profile.designation === null ||
        profile.email === null ||
        profile.image === null
    );

    if (incompleteProfiles.length > 0) {
      const allColloctionIncompleteProfilesIDS =
        allColloctionIncompleteProfiles.map((recruiter) => recruiter._id);

      const ChannelChat = await Chat.find({
        bring_assis: { $ne: null },
        recruiterid: { $in: allColloctionIncompleteProfilesIDS },
      }).populate("recruiterid");
      const formattedChannelChatCompletionPercentage = ChannelChat.map(
        (chat) => ({
          ...chat._doc,
          recruiter: {
            ...chat.recruiterid._doc,
            completionPercentage: incompleteProfiles
              .find(
                (profile) =>
                  profile._id.toString() === chat.recruiterid._id.toString()
              )
              .completionPercentage.toFixed(2),
          },
        })
      );
      const recruiter = await Recruiters.find({
        _id: { $in: allColloctionIncompleteProfilesIDS },
      });

      res.send({
        notCompliteProfileChannelChat: ChannelChat,
        notCompliteProfileChannelChatCompletionPercentage:
          formattedChannelChatCompletionPercentage,
        allNotCompleteProfileRecruiter: recruiter,
      });
    } else {
      res.status(404).send("No incomplete profiles found.");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post(
  "/recruter_profile_not_complete_sendMessage",

  async (req, res) => {
    try {
      if (req.query.isrecruiter === true || req.query.isrecruiter === "true") {
        const { recruterid, completionPercentage } = req.body;
        await recruterProfileMassagesend(recruterid, completionPercentage);
        res
          .status(200)
          .json({ success: true, message: "Message sent successfully" });
      } else {
        res.status(200).json({
          success: false,
          message: "use isrecruiter query true for send message",
        });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

async function recruterProfileMassagesend(
  recruterDataID,
  completionPercentage
) {
  let completionPercentageNumber = parseFloat(completionPercentage);
  let roundedPercentage = Math.round(completionPercentageNumber + 0.5);
  var recruter = await Recruiters.findOne({ _id: recruterDataID });
  var fullname = `${recruter.firstname !== null ? recruter.firstname : ""} ${
    recruter.lastname !== null ? recruter.lastname : ""
  }`;
  var recruterChannel = await Chat.findOne({ recruiterid: recruterDataID });
  var channelDataID = recruterChannel._id;
  var message = {
    createdAt: new Date().getTime(),
    text: `Hi ${fullname}, Thanks for be a partner of Unbolt new era of efficient recruitment.
Our AI has noticed that your profile completion is currently at ${roundedPercentage}%. This means that your profile and job posts are not fully visible to our AI algorithms, which could potentially affect your candidates search success. Incomplete profiles may not receive targeted recommendations to the right Job Seekers, which could reduce your chances of hiring  a perfect candidate!
    
We encourage you to complete your profile as soon as possible. Completing your profile will provide seekers with more information about your expected skills and experience, making it more likely that they will find you and your job posts in their suggestions.
    
Click here to finalize your profile completion now:
    `,
    button: "complete you'r recruter profile",
    secondText: `Thank you for your time and attention to this matter. We wish you the best of luck in your dream team setup.
    
If there anything we can help you with, feel free to reach us via WhatsApp +8801756175141.  `,
  };

  var msg = await Message({ channel: channelDataID, message: message });
  await msg.save();
  console.log(msg._id);
  console.log(channelDataID);
  await Chat.findOneAndUpdate(
    { _id: channelDataID },
    { $set: { "bring_assis.bringlastmessage": msg._id } }
  );
  bring_assistent_RecruterprofileNotComplite__notify_send(recruterDataID);
}
app.get(
  "/profile_not_complete_send_massage_all_recruter_one_time",
  async (req, res) => {
    try {
      const incompleteProfiles = await Recruiters.aggregate([
        {
          $lookup: {
            from: "companies",
            let: { userId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$userid", "$$userId"] },
                },
              },
            ],
            as: "companyname",
          },
        },
        {
          $project: {
            _id: 1,
            firstname: 1,
            lastname: 1,
            designation: 1,
            email: 1,
            image: 1,
            incompleteCollections: {
              companyname: { $eq: ["$companyname", []] },
            },
          },
        },
        {
          $project: {
            _id: 1,
            firstname: 1,
            lastname: 1,
            designation: 1,
            email: 1,
            image: 1,
            incompleteCollections: {
              companyname: { $eq: ["$companyname", []] },
            },
            completionPercentage: {
              $multiply: [
                {
                  $divide: [
                    {
                      $add: [
                        {
                          $cond: {
                            if: { $eq: ["$firstname", null] },
                            then: 0,
                            else: 1,
                          },
                        },
                        {
                          $cond: {
                            if: { $eq: ["$lastname", null] },
                            then: 0,
                            else: 1,
                          },
                        },
                        {
                          $cond: {
                            if: { $eq: ["$designation", null] },
                            then: 0,
                            else: 1,
                          },
                        },
                        {
                          $cond: {
                            if: { $eq: ["$email", null] },
                            then: 0,
                            else: 1,
                          },
                        },
                        {
                          $cond: {
                            if: { $eq: ["$image", null] },
                            then: 0,
                            else: 1,
                          },
                        },

                        {
                          $cond: {
                            if: {
                              $eq: ["$incompleteCollections.companyname", true],
                            },
                            then: 0,
                            else: 1,
                          },
                        },
                      ],
                    },
                    6, // total number of fields considered
                  ],
                },
                100, // multiply by 100 to get percentage
              ],
            },
          },
        },
        {
          $match: {
            $or: [
              { "incompleteCollections.companyname": true },
              { firstname: null },
              { lastname: null },
              { designation: null },
              { email: null },
              { image: null },
            ],
          },
        },
      ]);

      const allColloctionIncompleteProfiles = incompleteProfiles.filter(
        (profile) =>
          profile.incompleteCollections.companyname === true ||
          profile.firstname === null ||
          profile.lastname === null ||
          profile.designation === null ||
          profile.email === null ||
          profile.image === null
      );

      if (incompleteProfiles.length > 0) {
        const allColloctionIncompleteProfilesIDS =
          allColloctionIncompleteProfiles.map((recruiter) => recruiter._id);

        const ChannelChat = await Chat.find({
          bring_assis: { $ne: null },
          recruiterid: { $in: allColloctionIncompleteProfilesIDS },
        }).populate("recruiterid");
        const formattedChannelChatCompletionPercentage = ChannelChat.map(
          (chat) => ({
            ...chat._doc,
            recruiter: {
              ...chat.recruiterid._doc,
              completionPercentage: incompleteProfiles
                .find(
                  (profile) =>
                    profile._id.toString() === chat.recruiterid._id.toString()
                )
                .completionPercentage.toFixed(2),
            },
          })
        );

        for (const channel of formattedChannelChatCompletionPercentage) {
          var fullname = `${
            channel.recruiterid.firstname !== null
              ? channel.recruiterid.firstname
              : ""
          } ${
            channel.recruiterid.lastname !== null
              ? channel.recruiterid.lastname
              : ""
          }`;
          var completionPercentage = `${channel.recruiter.completionPercentage} `;
          let completionPercentageNumber = parseFloat(completionPercentage);
          let roundedPercentage = Math.round(completionPercentageNumber + 0.5);

          const message = {
            createdAt: new Date().getTime(),
            text: `Hi ${fullname}, Thanks for be a partner of Unbolt new era of efficient recruitment.
Our AI has noticed that your profile completion is currently at ${roundedPercentage}%. This means that your profile and job posts are not fully visible to our AI algorithms, which could potentially affect your candidates search success. Incomplete profiles may not receive targeted recommendations to the right Job Seekers, which could reduce your chances of hiring  a perfect candidate!
            
We encourage you to complete your profile as soon as possible. Completing your profile will provide seekers with more information about your expected skills and experience, making it more likely that they will find you and your job posts in their suggestions.
            
Click here to finalize your profile completion now:
            `,
            button: "complete you'r recruter profile",
            secondText: `Thank you for your time and attention to this matter. We wish you the best of luck in your dream team setup.
            
If there anything we can help you with, feel free to reach us via WhatsApp +8801756175141.  `,
          };

          var msg = await Message.create({
            channel: channel._id,
            message: message,
          });

          await Chat.findOneAndUpdate(
            { _id: channel._id },
            { $set: { "bring_assis.bringlastmessage": msg._id } }
          );

          // Assuming you have a function for notification
          bring_assistent_RecruterprofileNotComplite__notify_send(
            channel.recruiterid._id
          );
        }

        const recruiter = await Recruiters.find({
          _id: { $in: allColloctionIncompleteProfilesIDS },
        });

        res.send({
          notCompliteProfileChannelChat: ChannelChat,
          notCompliteProfileChannelChatCompletionPercentage:
            formattedChannelChatCompletionPercentage,
          allNotCompleteProfileRecruiter: recruiter,
        });
      } else {
        res.status(404).send("No incomplete profiles found.");
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

app.get("/profile_and_company_not_verify_recruter", async (req, res) => {
  try {
    const profileNotComplete = await Recruiters.find({
      $and: [
        { "other.company_verify": false },
        { "other.profile_verify": false },
      ],
    });
    console.log(profileNotComplete.length);
    if (profileNotComplete.length > 0) {
      const recruiterid = profileNotComplete.map((recruter) => recruter._id);
      const ChannelChat = await Chat.find({
        bring_assis: { $ne: null },
        recruiterid: { $in: recruiterid },
      }).populate("recruiterid");

      res.send({
        notCompliteProfileChannelChat: ChannelChat,
        notCompliteProfile: profileNotComplete,
      });
    } else {
      res.status(404).send("No incomplete profiles found.");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/recruter_profile_not_verify_sendMessage", async (req, res) => {
  try {
    if (req.query.isrecruiter === true || req.query.isrecruiter === "true") {
      const { recruterID } = req.body;
      var oldChanneldata = await Chat.findOne({
        bring_assis: { $ne: null },
        recruiterid: { $in: recruterID },
      });
      if (oldChanneldata?.length === 0 || oldChanneldata === null) {
        // Call the createAssistant function
        await createAssistant({
          id: recruterID,
          isrecruiter: true,
          email: "not verify",
        });
      } else {
        await recruterProfileNotverifyMassagesend(recruterID);
      }

      res
        .status(200)
        .json({ success: true, message: "Message sent successfully" });
    } else {
      res.status(200).json({
        success: false,
        message: "use isrecruiter query true for send message",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.get(
  "/profile_and_company_not_verify_recruter_send_messagw_one_time",
  async (req, res) => {
    try {
      const profileNotComplete = await Recruiters.find({
        $and: [
          { "other.company_verify": false },
          { "other.profile_verify": false },
        ],
      });
      console.log(profileNotComplete.length);
      if (profileNotComplete.length > 0) {
        const recruiterid = profileNotComplete.map((recruter) => recruter._id);
        const ChannelChat = await Chat.find({
          bring_assis: { $ne: null },
          recruiterid: { $in: recruiterid },
        }).populate("recruiterid");

        for (const channel of ChannelChat) {
          var fullname = `${
            channel.recruiterid.firstname !== null
              ? channel.recruiterid.firstname
              : ""
          } ${
            channel.recruiterid.lastname !== null
              ? channel.recruiterid.lastname
              : ""
          }`;
          const message = {
            createdAt: new Date().getTime(),
            text: `Hi ${fullname}, Thanks for joining Unbolt as a Recruiter.
        
Our AI has noticed that you didn’t completed your profile verification yet! To chat directly with the candidates and post unlimited free jobs please verify now your identity.`,
            button: "Verify Now",
            secondText:
              "If there anything we can help you with, feel free to reach us via WhatsApp +8801756175141",
          };

          var msg = await Message.create({
            channel: channel._id,
            message: message,
          });

          await Chat.findOneAndUpdate(
            { _id: channel._id },
            { $set: { "bring_assis.bringlastmessage": msg._id } }
          );

          // Assuming you have a function for notification
          bring_assistent_RecruterprofileNotVerify__notify_send(
            channel.recruiterid._id
          );
        }

        res.send({
          notCompliteProfileChannelChat: ChannelChat,
          notCompliteProfile: profileNotComplete,
        });
      } else {
        res.status(404).send("No incomplete profiles found.");
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

module.exports = app;
