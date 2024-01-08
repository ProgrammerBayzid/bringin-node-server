const express = require("express");
const app = express();
const User = require("../../Model/userModel");
const tokenverify = require("../../MiddleWare/tokenverify.js");
const jwt = require("jsonwebtoken");
const Experince = require("../../Model/experience.js");
const multer = require("multer");
const Recruiters = require("../../Model/Recruiter/recruiters");
const ViewJob = require("../../Model/viewjob");
const { Chat, Message } = require("../../Model/Chat/chat");
const JobSave = require("../../Model/jobsave.js");
const { Resume } = require("../../Model/resumefile");
const CvSendStore = require("../../Model/cv_send_store");
const redis = require("../../utils/redis");
const {
  bring_assistent_profileNotComplite__notify_send,
  notifySendWhenRecruterViewProfile,
} = require("../Notification/notification");
const Career_preferences = require("../../Model/career_preferences");
const viewCandidates = require("../../Model/viewCandidates");
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

// user get

async function profilenmberupdate(_id) {
  var viewjob = await ViewJob.find({ userid: _id });
  var jobsave = await JobSave.find({ userid: _id });
  var resume = await CvSendStore.find({ userid: _id });
  var chat = await Chat.find({ seekerid: _id, type: 1 });
  var carearpre = await Career_preferences.find({ userid: _id });
  await User.findByIdAndUpdate(
    { _id: _id },
    {
      $set: {
        "other.viewjob": viewjob.length,
        "other.cvsend": resume.length,
        "other.totalchat": chat.length,
        "other.savejob": jobsave.length,
        "other.carearpre": carearpre.length,
      },
    }
  );
}

app.get("/users", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;
    const singalUser = await User.findById(_id).populate("experiencedlevel");
    Promise.all([profilenmberupdate(_id)]);
    res.send(singalUser);
  } catch (error) {
    res.send(error);
  }
});

//   // # update user data

app.post("/users", tokenverify, upload.single("image"), async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;

    if (req.file) {
      await User.findByIdAndUpdate(_id, {
        $set: { image: req.file.path },
      });
    }
    const updateUser = await User.findByIdAndUpdate(
      _id,
      {
        $set: {
          fastname: req.body.fastname,
          lastname: req.body.lastname,
          gender: req.body.gender,
          experiencedlevel: req.body.experiencedlevel,
          startedworking: req.body.startedworking,
          deatofbirth: req.body.deatofbirth,
          email: req.body.email,
          secoundnumber: req.body.number,
        },
      },
      {
        new: true,
      }
    );

    res.status(200).json({ message: "Successfully Updated" });
  } catch (error) {
    res.status(404).send(error);
  }
});

// experience get

app.get("/experiencelist", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;
    const cacheKey = `experiencelist`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log("sending data from redis");
      return res.status(200).json(JSON.parse(cachedData));
    }
    var experidata = await Experince.find().sort("sortOrder");
    res.json(experidata);
    redis.set(cacheKey, JSON.stringify(experidata), 60 * 60 * 24 * 7);
  } catch (error) {
    res.send(error);
  }
});

app.post("/notification", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;
    if (req.body.isrecruiter == true) {
      await Recruiters.findOneAndUpdate(
        { _id: _id },
        {
          $set: {
            "other.notification.push_notification": req.body.push,
            "other.notification.whatsapp_notification": req.body.whatsapp,
            "other.notification.sms_notification": req.body.sms,
            "other.notification.job_recommandation": req.body.job,
          },
        }
      );
      res.status(200).json({ message: "Updated successfully" });
    } else {
      const singalUser = await User.findOneAndUpdate(
        { _id: _id },
        {
          $set: {
            "other.notification.push_notification": req.body.push,
            "other.notification.whatsapp_notification": req.body.whatsapp,
            "other.notification.sms_notification": req.body.sms,
            "other.notification.job_recommandation": req.body.job,
          },
        }
      );
      res.status(200).json({ message: "Successfully Updated" });
    }
  } catch (error) {
    res.send(error);
  }
});

app.post("/job_hunting", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;
    const singalUser = await User.findOneAndUpdate(
      { _id: _id },
      {
        $set: {
          "other.job_hunting": req.body.job_hunting,
          "other.more_status": req.body.more_status,
          "other.job_right_now": req.body.job_right_now,
        },
      }
    );
    res.status(200).json({ message: "Successfully Updated" });
  } catch (error) {
    res.send(error);
  }
});

app.post("/push_notification", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;
    if (req.body.isrecruiter == true) {
      await Recruiters.findOneAndUpdate(
        { _id: _id },
        {
          $set: {
            "other.pushnotification": req.body.pushnotification,
          },
        }
      );
      res.status(200).json({ message: "Successfully Updated" });
    } else {
      const singalUser = await User.findOneAndUpdate(
        { _id: _id },
        {
          $set: {
            "other.pushnotification": req.body.pushnotification,
          },
        }
      );
      res.status(200).json({ message: "Update successfully" });
    }
  } catch (error) {
    res.send(error);
  }
});

// profile not complite user get

app.get("/profile_not_complete_seeker", async (req, res) => {
  try {
    const incompleteProfiles = await User.aggregate([
      // ... Your existing lookup stages ...
      {
        $lookup: {
          from: "career_preferences",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$userid", "$$userId"] },
              },
            },
          ],
          as: "careerPreferences",
        },
      },
      {
        $lookup: {
          from: "educations",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$userid", "$$userId"] },
              },
            },
          ],
          as: "education_s",
        },
      },
      {
        $lookup: {
          from: "workexperiences",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$userid", "$$userId"] },
              },
            },
          ],
          as: "workexperience_s",
        },
      },

      {
        $lookup: {
          from: "protfoliolinks",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$userid", "$$userId"] },
              },
            },
          ],
          as: "protfoliolink_s",
        },
      },
      // Project stage to check incomplete collections
      {
        $project: {
          _id: 1,
          fastname: 1,
          lastname: 1,
          gender: 1,
          experiencedlevel: 1,
          startedworking: 1,
          image: 1,
          deatofbirth: 1,
          email: 1,
          incompleteCollections: {
            careerPreferences: { $eq: ["$careerPreferences", []] },
            education_s: { $eq: ["$education_s", []] },
            workexperience_s: { $eq: ["$workexperience_s", []] },
            protfoliolink_s: { $eq: ["$protfoliolink_s", []] },
          },
        },
      },

      {
        $project: {
          _id: 1,
          fastname: 1,
          lastname: 1,
          gender: 1,
          experiencedlevel: 1,
          startedworking: 1,
          image: 1,
          deatofbirth: 1,
          email: 1,
          incompleteCollections: {
            careerPreferences: { $eq: ["$careerPreferences", []] },
            education_s: { $eq: ["$education_s", []] },
            workexperience_s: { $eq: ["$workexperience_s", []] },
            protfoliolink_s: { $eq: ["$protfoliolink_s", []] },
          },
          completionPercentage: {
            $multiply: [
              {
                $divide: [
                  {
                    $add: [
                      {
                        $cond: {
                          if: { $eq: ["$fastname", null] },
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
                          if: { $eq: ["$gender", null] },
                          then: 0,
                          else: 1,
                        },
                      },
                      {
                        $cond: {
                          if: { $eq: ["$experiencedlevel", null] },
                          then: 0,
                          else: 1,
                        },
                      },
                      {
                        $cond: {
                          if: { $eq: ["$startedworking", null] },
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
                          if: { $eq: ["$deatofbirth", null] },
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
                          if: {
                            $eq: [
                              "$incompleteCollections.careerPreferences",
                              true,
                            ],
                          },
                          then: 0,
                          else: 1,
                        },
                      },
                      {
                        $cond: {
                          if: {
                            $eq: ["$incompleteCollections.education_s", true],
                          },
                          then: 0,
                          else: 1,
                        },
                      },
                      {
                        $cond: {
                          if: {
                            $eq: [
                              "$incompleteCollections.workexperience_s",
                              true,
                            ],
                          },
                          then: 0,
                          else: 1,
                        },
                      },
                      {
                        $cond: {
                          if: {
                            $eq: [
                              "$incompleteCollections.protfoliolink_s",
                              true,
                            ],
                          },
                          then: 0,
                          else: 1,
                        },
                      },
                    ],
                  },
                  12, // total number of fields considered
                ],
              },
              100, // multiply by 100 to get percentage
            ],
          },
        },
      },

      // Match profiles with incomplete collections
      {
        $match: {
          $or: [
            { "incompleteCollections.careerPreferences": true },
            { "incompleteCollections.education_s": true },
            { "incompleteCollections.workexperience_s": true },
            { "incompleteCollections.protfoliolink_s": true },
            { fastname: null },
            { lastname: null },
            { gender: null },
            { experiencedlevel: null },
            { startedworking: null },
            { image: null },
            { deatofbirth: null },
            { email: null },
          ],
        },
      },
    ]);

    // Separate incomplete profiles based on each collection
    const allColloctionIncompleteProfiles = incompleteProfiles.filter(
      (profile) =>
        profile.incompleteCollections.careerPreferences === true ||
        profile.incompleteCollections.workexperience_s === true ||
        profile.incompleteCollections.education_s === true ||
        profile.incompleteCollections.protfoliolink_s === true ||
        profile.fastname === null ||
        profile.lastname === null ||
        profile.gender === null ||
        profile.experiencedlevel === null ||
        profile.startedworking === null ||
        profile.image === null ||
        profile.deatofbirth === null ||
        profile.email === null
    );
    const careerPreferencesIncompleteProfiles = incompleteProfiles.filter(
      (profile) => profile.incompleteCollections.careerPreferences === true
    );
    const workexperienceIncompleteProfiles = incompleteProfiles.filter(
      (profile) => profile.incompleteCollections.workexperience_s === true
    );

    const protfoliolinkIncompleteProfiles = incompleteProfiles.filter(
      (profile) => profile.incompleteCollections.protfoliolink_s === true
    );
    const educationIncompleteProfiles = incompleteProfiles.filter(
      (profile) => profile.incompleteCollections.education_s === true
    );

    if (incompleteProfiles.length > 0) {
      const allColloctionIncompleteProfilesIDS =
        allColloctionIncompleteProfiles.map((user) => user._id);
      const ChannelChat = await Chat.find({
        bring_assis: { $ne: null },
        seekerid: { $in: allColloctionIncompleteProfilesIDS },
      }).populate("seekerid");

      const formattedChannelChatCompletionPercentage = ChannelChat.map(
        (chat) => ({
          ...chat._doc,
          seeker: {
            ...chat.seekerid._doc,
            completionPercentage: incompleteProfiles
              .find(
                (profile) =>
                  profile._id.toString() === chat.seekerid._id.toString()
              )
              .completionPercentage.toFixed(2),
          },
        })
      );

      const seeker = await User.find({
        _id: { $in: allColloctionIncompleteProfilesIDS },
      });
      res.send({
        notCompliteProfileChannelChat: ChannelChat,
        completionPercentageNotCompliteProfileChannelChat:
          formattedChannelChatCompletionPercentage,
        allNotCompleteSeekerProfile: seeker,
        careerPreferencesIncompleteProfiles:
          careerPreferencesIncompleteProfiles,
        workexperienceIncompleteProfiles: workexperienceIncompleteProfiles,
        protfoliolinkIncompleteProfiles: protfoliolinkIncompleteProfiles,
        educationIncompleteProfiles: educationIncompleteProfiles,
      });
    } else {
      res.status(404).send("No incomplete profiles found.");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post(
  "/seeker_profile_not_complete_sendMessage",
  tokenverify,
  async (req, res) => {
    try {
      if (
        req.query.isrecruiter === false ||
        req.query.isrecruiter === "false"
      ) {
        const { userId, completionPercentage } = req.body;
        await massagesend(userId, completionPercentage);
        res
          .status(200)
          .json({ success: true, message: "Message sent successfully" });
      } else {
        res
          .status(200)
          .json({ success: false, message: "use isrecruiter query false" });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

async function massagesend(userId, completionPercentage) {
  let completionPercentageNumber = parseFloat(completionPercentage);
  let roundedPercentage = Math.round(completionPercentageNumber + 0.5);


  var seek = await User.findOne({ _id: userId });
  var fullname = `${seek.fastname !== null ? seek.fastname : ""} ${
    seek.lastname !== null ? seek.lastname : ""
  }`;
  var seekerChannel = await Chat.findOne({ seekerid: userId });
  var channelDataID = seekerChannel._id;
  var sendMessage = {
    createdAt: new Date().getTime(),
    text: `Dear ${fullname},
Our AI has noticed that your profile completion is currently at ${roundedPercentage}%. This means that your profile is not fully visible to our AI algorithms, which could potentially affect your job search success. Incomplete profiles may not receive targeted recommendations to the right recruiters, which could reduce your chances of securing a job!
    
To help you maximize your profile visibility and enhance your job prospects, we encourage you to complete your profile as soon as possible. Completing your profile will provide recruiters with more information about your skills and experience, making it more likely that they will find you in their suggestions and consider you for open positions.
    
Finalize your profile completion now: `,
    button: "Click here",
    secondText: `Thank you for your time and attention to this matter. We wish you the best of luck in your job search.
    
Sincerely,
Unbolt Job Placement Team 
    `,
  };
  var msg = await Message({ channel: channelDataID, message: sendMessage });
  await msg.save();
  await Chat.findOneAndUpdate(
    { _id: channelDataID },
    { $set: { "bring_assis.bringlastmessage": msg._id } }
  );
  bring_assistent_profileNotComplite__notify_send(userId);
}

app.get(
  "/profile_not_complete_seeker_send_massage_all_seeker_one_time",
  async (req, res) => {
    try {
      const incompleteProfiles = await User.aggregate([
        // ... Your existing lookup stages ...
        {
          $lookup: {
            from: "career_preferences",
            let: { userId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$userid", "$$userId"] },
                },
              },
            ],
            as: "careerPreferences",
          },
        },
        {
          $lookup: {
            from: "educations",
            let: { userId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$userid", "$$userId"] },
                },
              },
            ],
            as: "education_s",
          },
        },
        {
          $lookup: {
            from: "workexperiences",
            let: { userId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$userid", "$$userId"] },
                },
              },
            ],
            as: "workexperience_s",
          },
        },

        {
          $lookup: {
            from: "protfoliolinks",
            let: { userId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$userid", "$$userId"] },
                },
              },
            ],
            as: "protfoliolink_s",
          },
        },
        // Project stage to check incomplete collections
        {
          $project: {
            _id: 1,
            fastname: 1,
            lastname: 1,
            gender: 1,
            experiencedlevel: 1,
            startedworking: 1,
            image: 1,
            deatofbirth: 1,
            email: 1,
            incompleteCollections: {
              careerPreferences: { $eq: ["$careerPreferences", []] },
              education_s: { $eq: ["$education_s", []] },
              workexperience_s: { $eq: ["$workexperience_s", []] },
              protfoliolink_s: { $eq: ["$protfoliolink_s", []] },
            },
          },
        },

        {
          $project: {
            _id: 1,
            fastname: 1,
            lastname: 1,
            gender: 1,
            experiencedlevel: 1,
            startedworking: 1,
            image: 1,
            deatofbirth: 1,
            email: 1,
            incompleteCollections: {
              careerPreferences: { $eq: ["$careerPreferences", []] },
              education_s: { $eq: ["$education_s", []] },
              workexperience_s: { $eq: ["$workexperience_s", []] },
              protfoliolink_s: { $eq: ["$protfoliolink_s", []] },
            },
            completionPercentage: {
              $multiply: [
                {
                  $divide: [
                    {
                      $add: [
                        {
                          $cond: {
                            if: { $eq: ["$fastname", null] },
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
                            if: { $eq: ["$gender", null] },
                            then: 0,
                            else: 1,
                          },
                        },
                        {
                          $cond: {
                            if: { $eq: ["$experiencedlevel", null] },
                            then: 0,
                            else: 1,
                          },
                        },
                        {
                          $cond: {
                            if: { $eq: ["$startedworking", null] },
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
                            if: { $eq: ["$deatofbirth", null] },
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
                            if: {
                              $eq: [
                                "$incompleteCollections.careerPreferences",
                                true,
                              ],
                            },
                            then: 0,
                            else: 1,
                          },
                        },
                        {
                          $cond: {
                            if: {
                              $eq: ["$incompleteCollections.education_s", true],
                            },
                            then: 0,
                            else: 1,
                          },
                        },
                        {
                          $cond: {
                            if: {
                              $eq: [
                                "$incompleteCollections.workexperience_s",
                                true,
                              ],
                            },
                            then: 0,
                            else: 1,
                          },
                        },
                        {
                          $cond: {
                            if: {
                              $eq: [
                                "$incompleteCollections.protfoliolink_s",
                                true,
                              ],
                            },
                            then: 0,
                            else: 1,
                          },
                        },
                      ],
                    },
                    12, // total number of fields considered
                  ],
                },
                100, // multiply by 100 to get percentage
              ],
            },
          },
        },

        // Match profiles with incomplete collections
        {
          $match: {
            $or: [
              { "incompleteCollections.careerPreferences": true },
              { "incompleteCollections.education_s": true },
              { "incompleteCollections.workexperience_s": true },
              { "incompleteCollections.protfoliolink_s": true },
              { fastname: null },
              { lastname: null },
              { gender: null },
              { experiencedlevel: null },
              { startedworking: null },
              { image: null },
              { deatofbirth: null },
              { email: null },
            ],
          },
        },
      ]);

      // Separate incomplete profiles based on each collection
      const allColloctionIncompleteProfiles = incompleteProfiles.filter(
        (profile) =>
          profile.incompleteCollections.careerPreferences === true ||
          profile.incompleteCollections.workexperience_s === true ||
          profile.incompleteCollections.education_s === true ||
          profile.incompleteCollections.protfoliolink_s === true ||
          profile.fastname === null ||
          profile.lastname === null ||
          profile.gender === null ||
          profile.experiencedlevel === null ||
          profile.startedworking === null ||
          profile.image === null ||
          profile.deatofbirth === null ||
          profile.email === null
      );
      const careerPreferencesIncompleteProfiles = incompleteProfiles.filter(
        (profile) => profile.incompleteCollections.careerPreferences === true
      );
      const workexperienceIncompleteProfiles = incompleteProfiles.filter(
        (profile) => profile.incompleteCollections.workexperience_s === true
      );

      const protfoliolinkIncompleteProfiles = incompleteProfiles.filter(
        (profile) => profile.incompleteCollections.protfoliolink_s === true
      );
      const educationIncompleteProfiles = incompleteProfiles.filter(
        (profile) => profile.incompleteCollections.education_s === true
      );

      if (incompleteProfiles.length > 0) {
        const allColloctionIncompleteProfilesIDS =
          allColloctionIncompleteProfiles.map((user) => user._id);
        const ChannelChat = await Chat.find({
          bring_assis: { $ne: null },
          seekerid: { $in: allColloctionIncompleteProfilesIDS },
        }).populate("seekerid");

        const formattedChannelChatCompletionPercentage = ChannelChat.map(
          (chat) => ({
            ...chat._doc,
            seeker: {
              ...chat.seekerid._doc,
              completionPercentage: incompleteProfiles
                .find(
                  (profile) =>
                    profile._id.toString() === chat.seekerid._id.toString()
                )
                .completionPercentage.toFixed(2),
            },
          })
        );

        for (const channel of formattedChannelChatCompletionPercentage) {
          var fullname = `${
            channel.seeker.fastname !== null ? channel.seeker.fastname : ""
          } ${channel.seeker.lastname !== null ? channel.seeker.lastname : ""}`;
          var completionPercentage = `${channel.seeker.completionPercentage}`;
          let completionPercentageNumber = parseFloat(completionPercentage);
          let roundedPercentage = Math.round(completionPercentageNumber + 0.5);

          const message = {
            createdAt: new Date().getTime(),
            text: `Dear ${fullname},
Our AI has noticed that your profile completion is currently at ${roundedPercentage}%. This means that your profile is not fully visible to our AI algorithms, which could potentially affect your job search success. Incomplete profiles may not receive targeted recommendations to the right recruiters, which could reduce your chances of securing a job!
            
To help you maximize your profile visibility and enhance your job prospects, we encourage you to complete your profile as soon as possible. Completing your profile will provide recruiters with more information about your skills and experience, making it more likely that they will find you in their suggestions and consider you for open positions.
            
Finalize your profile completion now: `,
            button: "Click here",
            secondText: `Thank you for your time and attention to this matter. We wish you the best of luck in your job search.
            
Sincerely,
Unbolt Job Placement Team 
            `,
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
          bring_assistent_profileNotComplite__notify_send(channel.seekerid._id);
        }

        const seeker = await User.find({
          _id: { $in: allColloctionIncompleteProfilesIDS },
        });
        res.send({
          notCompliteProfileChannelChat: ChannelChat,
          completionPercentageNotCompliteProfileChannelChat:
            formattedChannelChatCompletionPercentage,
          allNotCompleteSeekerProfile: seeker,
          careerPreferencesIncompleteProfiles:
            careerPreferencesIncompleteProfiles,
          workexperienceIncompleteProfiles: workexperienceIncompleteProfiles,
          protfoliolinkIncompleteProfiles: protfoliolinkIncompleteProfiles,
          educationIncompleteProfiles: educationIncompleteProfiles,
        });
      } else {
        res.status(404).send("No incomplete profiles found.");
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

app.post("/seeker_profile_view_notify_send", async (req, res) => {
  try {
    if (req.query.isrecruiter === false || req.query.isrecruiter === "false") {
      const { recruterID, seekerFullProfileID } = req.body;
      await notifySendWhenRecruterViewProfile(recruterID, seekerFullProfileID);
      await viewCandidates({
        recruterID: req.body.recruterID,
        seekerFullProfileID: req.body.seekerFullProfileID,
      }).save();
      res
        .status(200)
        .json({ success: true, message: "Notification sent successfully" });
    } else {
      res
        .status(200)
        .json({ success: false, message: "Use isrecruiter query false" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = app;
