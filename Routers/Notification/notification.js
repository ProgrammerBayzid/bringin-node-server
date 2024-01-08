const express = require("express");
const apps = express();
const Career_preferences = require("../../Model/career_preferences");
const Recruiter = require("../../Model/Recruiter/recruiters");
const { Chat, Message } = require("../../Model/Chat/chat");
const User = require("../../Model/userModel");
const { Profiledata } = require("../../Model/Seeker_profile_all_details");
const recruiters = require("../../Model/Recruiter/recruiters");


var sendNotification = function (data) {
  // console.log("notification data", data);
  var headers = {
    "Content-Type": "application/json; charset=utf-8",
    Authorization: "Basic NWUwMmExM2UtMmJlOC00YTEyLWE0ODUtMzE5NTAzZjYzMzhh",
  };

  var options = {
    host: "onesignal.com",
    port: 443,
    path: "/api/v1/notifications",
    method: "POST",
    headers: headers,
  };

  var https = require("https");
  var req = https.request(options, function (res) {
    res.on("data", function (data) {
      console.log("Response b:");
      console.log("v", JSON.parse(data));
    });
  });

  req.on("error", function (e) {
    console.log("ERROR:");
    console.log("d", e);
  });

  req.write(JSON.stringify(data));
  req.end();
};

const updateSendNotification = async (data) => {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    Authorization: "Basic NWUwMmExM2UtMmJlOC00YTEyLWE0ODUtMzE5NTAzZjYzMzhh",
  };

  try {
    const response = await axios.post(
      "https://onesignal.com/api/v1/notifications",
      JSON.stringify(data),
      {
        headers: headers,
      }
    );
    console.log("Response:", response.data);
  } catch (error) {
    console.error("ERROR:", error);
  }
};

apps.post("/single_notification_send", async (req, res) => {
  var message = {
    app_id: "74463dd2-b8de-4624-a679-0221b4b0af85",
    data: req.body.data,
    contents: { en: req.body.message },
    headings: { en: req.body.title },
    android_channel_id: "39d13464-1a8e-4fa7-88ea-e42d8af163f0",
    include_player_ids: [req.body.playerid],
  };
  console.log("single_notification_send ", message);
  sendNotification(message);
  res.status(200).json({ message: "Notifiation send" });
});

// async function notificaton_send_by_job(functionalid, recruiterid, mapdata) {
//   try {
//     console.log(recruiterid);
//     var data = await Career_preferences.find({ functionalarea: functionalid })
//       .select({ userid: 1 })
//       .populate([{ path: "userid" }, { path: "functionalarea" }]);
//     let notificationid = [];
//     let functionalname = "";
//     let enablentf = false;
//     for (let index = 0; index < data.length; index++) {
//       if (
//         data[index]["userid"]["other"]["notification"]["push_notification"] ==
//         true
//       ) {
//         notificationid.push(data[index]["userid"]["other"]["pushnotification"]);
//         functionalname = data[index]["functionalarea"]["functionalname"];
//       }
//     }
//     var recruiterinfo = await Recruiter.findOne({ _id: recruiterid });

//     console.log(notificationid);

//     var message = {
//       app_id: "74463dd2-b8de-4624-a679-0221b4b0af85",
//       data: mapdata,
//       contents: {
//         en: `${recruiterinfo.firstname} ${recruiterinfo.lastname} has posted a job for “${functionalname}”`,
//       },
//       headings: { en: `${recruiterinfo.firstname} ${recruiterinfo.lastname}` },
//       include_player_ids: notificationid,
//       android_channel_id: "39d13464-1a8e-4fa7-88ea-e42d8af163f0",
//     };
//     if (notificationid.length > 0) {
//       sendNotification(message);
//       console.log(message);
//     }
//   } catch (error) {
//     console.log(error);
//   }
// }
async function notificaton_send_by_job(functionalid, recruiterid, mapdata) {
  try {
    console.log(recruiterid);
    var data = await Career_preferences.find({ functionalarea: functionalid })
      .select({ userid: 1 })
      .populate([{ path: "userid" }, { path: "functionalarea" }]);
    let notificationid = [];
    let functionalname = "";
    let enablentf = false;

    for (let index = 0; index < data.length; index++) {
      const user = data[index]["userid"];

      // Check if 'other' property exists before accessing its properties
      if (user && user.other) {
        if (
          user.other.notification &&
          user.other.notification.push_notification === true
        ) {
          notificationid.push(user.other.pushnotification);
          functionalname = data[index]["functionalarea"]["functionalname"];
        }
      }
    }

    var recruiterinfo = await Recruiter.findOne({ _id: recruiterid });

    // console.log("notificationid", notificationid);

    var message = {
      app_id: "74463dd2-b8de-4624-a679-0221b4b0af85",
      data: mapdata,
      contents: {
        en: `${recruiterinfo.firstname} ${recruiterinfo.lastname} has posted a job for “${functionalname}”`,
      },
      headings: { en: `${recruiterinfo.firstname} ${recruiterinfo.lastname}` },
      include_player_ids: notificationid,
      android_channel_id: "39d13464-1a8e-4fa7-88ea-e42d8af163f0",
    };

    if (notificationid.length > 0) {
      sendNotification(message);
      // console.log("message", message);
    }
  } catch (error) {
    console.log("vi ato error kano", error);
    console.log("vi ato error kano", error);
  }
}

async function notificaton_send_by_verifyAprove(recruterID) {
  try {
    let include_player_ids;
    var recruter = await Recruiter.findOne({ _id: recruterID });
    fullname = `${recruter.firstname} ${recruter.lastname}`;
    include_player_ids = recruter.other.pushnotification;

    var message = {
      app_id: "74463dd2-b8de-4624-a679-0221b4b0af85",

      contents: {
        en: `You can post free unlimited jobs & chat directly with the Job Seekers.`,
      },
      headings: {
        en: `Hi ${fullname}, Congratulations! Your Identity is completely verified.`,
      },
      include_player_ids: [include_player_ids],
      android_channel_id: "39d13464-1a8e-4fa7-88ea-e42d8af163f0",
      data: {
        recruiter: true,
        is_assistant: true,
        type: 1,
      },
    };

    sendNotification(message);
  } catch (error) {
    console.log("e", error);
  }
}
async function verirySuccessMassagesend(recruterID) {
  var recruter = await Recruiter.findOne({ _id: recruterID });
  fullname = `${recruter.firstname} ${recruter.lastname}`;
  var recruterChannel = await Chat.findOne({ recruiterid: recruterID });
  var channelDataID = recruterChannel._id;

  var sendMessage = {
    createdAt: new Date().getTime(),
    text: `Hi ${fullname}, Thanks for verifying your identity with Unbolt.
Now you can post unlimited free jobs and chat directly with the Job Seekers. Hire the right people and build your dream team. Happy Hiring!
    
If there anything we can help you with, feel free to reach us via WhatsApp +8801756175141.`,
  };
  var msg = await Message({ channel: channelDataID, message: sendMessage });
  await msg.save();
  console.log(msg._id);
  console.log(channelDataID);
  await Chat.findOneAndUpdate(
    { _id: channelDataID },
    { $set: { "bring_assis.bringlastmessage": msg._id } }
  );
  notificaton_send_by_verifyAprove(recruterID);
}

async function notificaton_send_by_verifyDocumentSubmitSuccess(recruterID) {
  try {
    let include_player_ids;
    var recruter = await Recruiter.findOne({ _id: recruterID });
    fullname = `${recruter.firstname} ${recruter.lastname}`;
    include_player_ids = recruter.other.pushnotification;

    var message = {
      app_id: "74463dd2-b8de-4624-a679-0221b4b0af85",

      contents: {
        en: `Your document uploded.`,
      },
      headings: {
        en: `Hi ${fullname}, thanks to uploded document .`,
      },
      include_player_ids: [include_player_ids],
      android_channel_id: "39d13464-1a8e-4fa7-88ea-e42d8af163f0",
      data: {
        recruiter: true,
        is_assistant: true,
        type: 1,
      },
    };

    sendNotification(message);
  } catch (error) {
    console.log("e", error);
  }
}
async function documentSubmitSuccessMassagesend(recruterID) {
  var recruter = await Recruiter.findOne({ _id: recruterID });
  fullname = `${recruter.firstname} ${recruter.lastname}`;
  var recruterChannel = await Chat.findOne({ recruiterid: recruterID });
  var channelDataID = recruterChannel._id;

  var sendMessage = {
    createdAt: new Date().getTime(),
    text: `Hi ${fullname}, Thanks for  uploded document for verifying your identity with Unbolt.
    
If there anything we can help you with, feel free to reach us via WhatsApp +8801756175141.`,
  };
  var msg = await Message({ channel: channelDataID, message: sendMessage });
  await msg.save();
  console.log(msg._id);
  console.log(channelDataID);
  await Chat.findOneAndUpdate(
    { _id: channelDataID },
    { $set: { "bring_assis.bringlastmessage": msg._id } }
  );
  notificaton_send_by_verifyDocumentSubmitSuccess(recruterID);
}

async function notificaton_send_by_jobHidden(recruiterid, mapdata) {
  try {
    var recruiterinfo = await Recruiter.findOne({ _id: recruiterid });

    if (!recruiterinfo) {
      console.log("Recruiter not found.");
      return;
    }

    let notificationid = [];
    if (recruiterinfo.other.notification.push_notification === true) {
      notificationid.push(recruiterinfo.other.pushnotification);
    } else {
      console.log("Push notification disabled for this recruiter.");
      return;
    }

    if (notificationid.length === 0) {
      console.log("No valid notification recipient.");
      return;
    }

    var message = {
      app_id: "74463dd2-b8de-4624-a679-0221b4b0af85",
      data: mapdata,
      contents: {
        en: `Hi ${recruiterinfo.firstname} ${recruiterinfo.lastname}, Your Unbolt Job Hidden.`,
      },
      headings: { en: "" },
      include_player_ids: notificationid, // Ensure notificationid is a valid player ID
      android_channel_id: "39d13464-1a8e-4fa7-88ea-e42d8af163f0",
    };
    console.log("notificationid", notificationid);
    sendNotification(message); // Assuming you have a function named sendNotification
  } catch (error) {
    console.log("e", error);
  }
}
async function notificaton_send_by_jobPublice(recruiterid, mapdata) {
  try {
    var recruiterinfo = await Recruiter.findOne({ _id: recruiterid });

    if (!recruiterinfo) {
      console.log("Recruiter not found.");
      return;
    }

    let notificationid = [];
    if (recruiterinfo.other.notification.push_notification === true) {
      notificationid.push(recruiterinfo.other.pushnotification);
    } else {
      console.log("Push notification disabled for this recruiter.");
      return;
    }

    if (notificationid.length === 0) {
      console.log("No valid notification recipient.");
      return;
    }

    var message = {
      app_id: "74463dd2-b8de-4624-a679-0221b4b0af85",
      data: mapdata,
      contents: {
        en: `Hi ${recruiterinfo.firstname} ${recruiterinfo.lastname}, Your Unbolt Job Publice.`,
      },
      headings: { en: "" },
      include_player_ids: notificationid, // Ensure notificationid is a valid player ID
      android_channel_id: "39d13464-1a8e-4fa7-88ea-e42d8af163f0",
    };
    // console.log("notificationid", notificationid);
    sendNotification(message); // Assuming you have a function named sendNotification
  } catch (error) {
    console.log("e", error);
  }
}
async function notificaton_send_by_jobDelete(recruiterid, mapdata) {
  try {
    var recruiterinfo = await Recruiter.findOne({ _id: recruiterid });

    if (!recruiterinfo) {
      console.log("Recruiter not found.");
      return;
    }

    let notificationid = [];
    if (recruiterinfo.other.notification.push_notification === true) {
      notificationid.push(recruiterinfo.other.pushnotification);
    } else {
      console.log("Push notification disabled for this recruiter.");
      return;
    }

    if (notificationid.length === 0) {
      console.log("No valid notification recipient.");
      return;
    }

    var message = {
      app_id: "74463dd2-b8de-4624-a679-0221b4b0af85",
      data: mapdata,
      contents: {
        en: `Hi ${recruiterinfo.firstname} ${recruiterinfo.lastname}, Your Unbolt Job Delete.`,
      },
      headings: { en: "" },
      include_player_ids: notificationid, // Ensure notificationid is a valid player ID
      android_channel_id: "39d13464-1a8e-4fa7-88ea-e42d8af163f0",
    };
    console.log("notificationid", notificationid);
    sendNotification(message); // Assuming you have a function named sendNotification
  } catch (error) {
    console.log("e", error);
  }
}

async function single_msg_notifiation(channelid, recruiter) {
  var chatdata = await Chat.findOne({ _id: channelid })
    .select({ seekerid: 1, recruiterid: 1 })
    .populate([
      { path: "lastmessage" },
      { path: "seekerid", select: ["other", "fastname", "lastname"] },
      { path: "recruiterid", select: ["other", "firstname", "lastname"] },
    ]);

  //log other

  // console.log("chatdata seekerid",chatdata.seekerid);
  // console.log("chatdata recruiterid",chatdata.recruiterid);
  let mapdata = {
    channelid: channelid,
    recruiter: recruiter.recruiter,
    type: 1,
  };
  let include_player_ids;
  console.log(chatdata.recruiterid.other.pushnotification);
  if (recruiter.recruiter == true) {
    include_player_ids = chatdata.seekerid.other.pushnotification;
  } else {
    include_player_ids = chatdata.recruiterid.other.pushnotification;
  }

  var message = {
    app_id: "74463dd2-b8de-4624-a679-0221b4b0af85",
    data: mapdata,
    contents: { en: `${chatdata.lastmessage.message.text}` },
    headings: {
      en: `${chatdata.lastmessage.message.user.firstName} ${chatdata.lastmessage.message.user.lastName}`,
    },
    include_player_ids: [include_player_ids],
    android_channel_id: "39d13464-1a8e-4fa7-88ea-e42d8af163f0",
  };

  sendNotification(message);

  // if (recruiter.recruiter == true) {
  //   if (chatdata.seekerid.other.online == false) {
  //     sendNotification(message);
  //   }
  // } else {
  //   if (chatdata.recruiterid.other.online == false) {
  //     sendNotification(message);
  //   }
  // }
}

async function bring_assistent_notify_send(id, isrecruiter, channelid) {
  let fullname;
  let include_player_ids;

  if (isrecruiter == true) {
    var rec = await Recruiter.findOne({ _id: id });
    fullname = `${rec.firstname} ${rec.lastname}`;
    include_player_ids = rec.other.pushnotification;
  } else {
    var seek = await User.findOne({ _id: id });
    fullname = `${seek.fastname} ${seek.lastname}`;
    include_player_ids = seek.other.pushnotification;
  }

  var message = {
    app_id: "74463dd2-b8de-4624-a679-0221b4b0af85",

    contents: { en: `You are now approve to reach more.` },
    headings: {
      en: `Hi, ${fullname}! welcome to Unbolt!`,
    },
    include_player_ids: [include_player_ids],
    android_channel_id: "39d13464-1a8e-4fa7-88ea-e42d8af163f0",
    data: {
      channelid: channelid,
      recruiter: isrecruiter,
      is_assistant: true,
      type: 1,
    },
  };

  sendNotification(message);
}

async function bring_assistent_profileNotComplite__notify_send(id, channelid) {
  let include_player_ids;
  var seek = await User.findOne({ _id: id });
  var fullname = `${seek.fastname !== null ? seek.fastname : ""} ${
    seek.lastname !== null ? seek.lastname : ""
  }`;
  include_player_ids = seek.other.pushnotification;

  var message = {
    app_id: "74463dd2-b8de-4624-a679-0221b4b0af85",

    contents: {
      en: `Our AI is not recommending your profile to the right Recruiter.`,
    },
    headings: {

      en: `Hi, ${fullname}! Your Unbolt account is still incomplete!`,


    },
    include_player_ids: [include_player_ids],
    android_channel_id: "39d13464-1a8e-4fa7-88ea-e42d8af163f0",
    data: {
      channelid: channelid,
      recruiter: false,
      is_assistant: true,
      type: 1,
    },
  };

  sendNotification(message);
}
async function bring_assistent_RecruterprofileNotComplite__notify_send(id) {
  let include_player_ids;
  var rec = await Recruiter.findOne({ _id: id });
  var fullname = `${rec.firstname !== null ? rec.firstname : ""} ${
    rec.lastname !== null ? rec.lastname : ""
  }`;
  include_player_ids = rec.other.pushnotification;

  var message = {
    app_id: "74463dd2-b8de-4624-a679-0221b4b0af85",

    contents: {
      en: `You’re requested to complete your Unbolt profile to enhance your Job Posts.`,
    },
    headings: {
      en: `Hi ${fullname}, Your Unbolt Recruiter profile is still incomplete!.`,
    },
    include_player_ids: [include_player_ids],
    android_channel_id: "39d13464-1a8e-4fa7-88ea-e42d8af163f0",
    data: {
      recruiter: true,
      is_assistant: true,
      type: 1,
    },
  };

  sendNotification(message);
}
async function bring_assistent_RecruterprofileNotVerify__notify_send(id) {
  let include_player_ids;
  var rec = await Recruiter.findOne({ _id: id });
  var fullname = `${rec.firstname !== null ? rec.firstname : ""} ${
    rec.lastname !== null ? rec.lastname : ""
  }`;
  include_player_ids = rec.other.pushnotification;

  var message = {
    app_id: "74463dd2-b8de-4624-a679-0221b4b0af85",

    contents: { en: `To chat with the seekers and post jobs verify now.` },
    headings: {
      en: `Hi ${fullname}, Your Unbolt Recruiter Account is still unverified.`,
    },
    include_player_ids: [include_player_ids],
    android_channel_id: "39d13464-1a8e-4fa7-88ea-e42d8af163f0",
    data: {
      recruiter: true,
      is_assistant: true,
      type: 1,
    },
  };

  sendNotification(message);
}
async function recruterProfileNotverifyMassagesend(recruterID) {
  const recruterDataID = recruterID;
  var recruter = await Recruiter.findOne({ _id: recruterDataID });
  var fullname = `${recruter?.firstname !== null ? recruter?.firstname : ""} ${
    recruter?.lastname !== null ? recruter?.lastname : ""
  }`;
  console.log("fullname", fullname);

  var recruterChannel = await Chat.findOne({ recruiterid: recruterDataID });
  var channelDataID = recruterChannel._id;
  console.log("channelDataID", recruterChannel);
  var message = {
    createdAt: new Date().getTime(),
    text: `Hi ${fullname}, Thanks for joining Unbolt as a Recruiter.

Our AI has noticed that you didn’t completed your profile verification yet! To chat directly with the candidates and post unlimited free jobs please verify now your identity.`,
    button: "Verify Now",
    secondText:
      "If there anything we can help you with, feel free to reach us via WhatsApp +8801756175141",
  };
  var msg = await Message({ channel: channelDataID, message: message });
  await msg.save();
  console.log(msg._id);
  console.log(channelDataID);
  await Chat.findOneAndUpdate(
    { _id: channelDataID },
    { $set: { "bring_assis.bringlastmessage": msg._id } }
  );
  bring_assistent_RecruterprofileNotVerify__notify_send(recruterDataID);
}

// Define the function for creating assistant
async function createAssistant(data) {
  console.log(data);
  var olddata = await Chat.findOne({
    type: 2,
    seekerid: data.isrecruiter == false ? data.id : null,
    recruiterid: data.isrecruiter == true ? data.id : null,
  });

  if (olddata == null) {
    var channel = await Chat({
      seekerid: data.isrecruiter == false ? data.id : null,
      recruiterid: data.isrecruiter == true ? data.id : null,
      type: 2,
      bring_assis: {
        title: "Unbold Assistant",
        message1: "Hi, Jakaria! welcome to Unbold!",
        message2: "You are now approve to reach more.",
        bringlastmessage: null,
      },
    });
    await channel.save();
    var message = {
      createdAt: new Date().getTime(),
      text: `Welcome to Unbold! you are now approved to reach more! if there anything we can help you with, feel free to reach us at +88 01756175141 via WhatsApp.`,
    };
    var msg = await Message({ channel: channel._id, message: message });
    await msg.save();
    console.log(msg._id);
    console.log(channel._id);
    await Chat.findOneAndUpdate(
      { _id: channel._id },
      { $set: { "bring_assis.bringlastmessage": msg._id } }
    );
    console.log("bringin assistant create successfully");
    bring_assistent_notify_send(data.id, data.isrecruiter);
    if (data.email === true) {
      await verirySuccessMassagesend(data.id);
    } else if (data.email === false) {
      await documentSubmitSuccessMassagesend(data.id);
    } else if (data.email === "not verify") {
      await recruterProfileNotverifyMassagesend(data.id);
    }
  } else {
    console.log("bringin assistant Already create successfully");
  }
}

async function notifySendWhenRecruterViewProfile(
  recruterID,
  seekerFullProfileID
) {
  let include_player_ids;
  var recruter = await Recruiter.findOne({ _id: recruterID });
  fullnameRecrutere = `${
    recruter.firstname !== null ? recruter.firstname : ""
  } ${recruter.lastname !== null ? recruter.lastname : ""}`;
  var seeker = await Profiledata.findOne({ _id: seekerFullProfileID }).populate(
    "userid"
  );
  var fullnameSeeker = `${
    seeker.userid.fastname !== null ? seeker.userid.fastname : ""
  } ${seeker.userid.lastname !== null ? seeker.userid.lastname : ""}`;
  include_player_ids = seeker.userid.other.pushnotification;
  var message = {
    app_id: "74463dd2-b8de-4624-a679-0221b4b0af85",

    contents: { en: `${fullnameRecrutere} view You are profile.` },
    headings: {
      en: `Hi, ${fullnameSeeker}!`,
    },
    include_player_ids: [include_player_ids],
    android_channel_id: "39d13464-1a8e-4fa7-88ea-e42d8af163f0",
    data: {
      recruiter: false,
      is_assistant: true,
      type: 1,
    },
  };

  sendNotification(message);
}

module.exports = {
  apps,
  notificaton_send_by_job,
  single_msg_notifiation,
  notificaton_send_by_verifyAprove,
  bring_assistent_notify_send,
  notificaton_send_by_jobDelete,
  notificaton_send_by_jobPublice,
  notificaton_send_by_jobHidden,
  bring_assistent_profileNotComplite__notify_send,
  notifySendWhenRecruterViewProfile,
  bring_assistent_RecruterprofileNotComplite__notify_send,
  bring_assistent_RecruterprofileNotVerify__notify_send,
  verirySuccessMassagesend,
  notificaton_send_by_verifyDocumentSubmitSuccess,
  documentSubmitSuccessMassagesend,
  recruterProfileNotverifyMassagesend,
  createAssistant,
};

const notificationData = {
  app_id: "74463dd2-b8de-4624-a679-0221b4b0af85",
  data: { your_data_key: "your_data_value" },
  contents: { en: "Your notification message" },
  headings: { en: "Your notification title" },
  android_channel_id: "39d13464-1a8e-4fa7-88ea-e42d8af163f0",
  include_player_ids: ["2d2c78bf-74dd-41b1-9b58-8491b053adf0"],
};

// Call the sendNotification function
// sendNotification(notificationData);
