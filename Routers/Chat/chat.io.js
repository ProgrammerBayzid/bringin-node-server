const express = require("express");
const app = express();
const User = require("../../Model/userModel");
const Recruiter = require("../../Model/Recruiter/recruiters");
const tokenverify = require("../../MiddleWare/tokenverify.js");
const jwt = require("jsonwebtoken");
const Experince = require("../../Model/experience.js");
const { Chat, Message } = require("../../Model/Chat/chat");
const {
  single_msg_notifiation,
  bring_assistent_notify_send,
} = require("../../Routers/Notification/notification");
const multer = require("multer");
const fs = require("fs");
const { resolve } = require("path");
const { Console } = require("console");
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

async function singlemessage(message, io) {
  var data = await Message({
    channel: message.channelid,
    message: message.message,
  });
  data.save();
  await Chat.findOneAndUpdate(
    { _id: message.channelid },
    {
      $set: { lastmessage: data },
      $inc: {
        recruiter_unseen: seekerincrement(message),
        seeker_unseen: recruiterincrement(message),
      },
    }
  );
  seeker_convupdate(io, message.message.user.customProperties["seekerid"]);
  recruiter_convupdate(
    io,
    message.message.user.customProperties["recruiterid"]
  );
  single_msg_notifiation(
    message.channelid,
    message.message.user.customProperties
  );
}

async function greatingupdate(message) {
  await Chat.findOneAndUpdate(
    { _id: message.channelid },
    {
      $set: { greating: 1 },
    }
  );
}

function seekerincrement(message) {
  if (
    message.message.user.customProperties["recruiter"] == false &&
    message.message.customProperties["seen"] == false
  ) {
    return 1;
  } else if (
    message.message.user.customProperties["recruiter"] == false &&
    message.message.customProperties["seen"] == true
  ) {
    return 0;
  } else {
    return 0;
  }
}

function recruiterincrement(message) {
  if (
    message.message.user.customProperties["recruiter"] == true &&
    message.message.customProperties["seen"] == false
  ) {
    return 1;
  } else if (
    message.message.user.customProperties["recruiter"] == true &&
    message.message.customProperties["seen"] == true
  ) {
    return 0;
  } else {
    return 0;
  }
}

async function recruiterseen(id) {
  await Chat.findOneAndUpdate({ _id: id }, { $set: { recruiter_unseen: 0 } });
}
async function seekerseen(id) {
  await Chat.findOneAndUpdate({ _id: id }, { $set: { seeker_unseen: 0 } });
}

async function seeker_convupdate(io, seekerid) {
  new Promise(async (resolve, reject) => {
    var data2 = await channellistdata(false, seekerid);
    io.sockets.in(seekerid).emit("channellist", data2);
    // var data3 = await channellistdata(true ,recruiterid);
    // await io.sockets.in(recruiterid).emit("channellist", data3)
  });
}

async function recruiter_convupdate(io, recruiterid) {
  new Promise(async (resolve, reject) => {
    //   var data2 = await channellistdata(false ,seekerid);
    //   await io.sockets.in(seekerid).emit("channellist", data2)
    var data3 = await channellistdata(true, recruiterid);
    io.sockets.in(recruiterid).emit("channellist", data3);
  });
}

async function channellistdata(isrecruiter, currentid) {
  var data;
  var populate = [
    { path: "expertice_area" },
    { path: "experience" },
    { path: "education", select: "-digree" },
    {
      path: "company",
      populate: [
        { path: "c_size" },
        { path: "industry", select: "-category" },
        {
          path: "c_location.divisiondata",
          populate: { path: "cityid", select: "name" },
        },
      ],
    },
    { path: "salary.min_salary", select: "-other_salary" },
    { path: "salary.max_salary", select: "-other_salary" },
    { path: "skill" },
    { path: "jobtype" },
    {
      path: "job_location.divisiondata",
      populate: { path: "cityid", select: "name" },
    },
  ];
  var populate2 = [
    { path: "userid", populate: { path: "experiencedlevel" } },
    {
      path: "workexperience",
      options: {
        limit: 1,
      },
      populate: [
        { path: "category", select: "-functionarea" },
        "expertisearea",
      ],
    },
    {
      path: "education",
      options: {
        limit: 1,
      },
      populate: [
        {
          path: "digree",
          select: "-subject",
          populate: { path: "education", select: "-digree" },
        },
        "subject",
      ],
    },
    "skill",
    "protfoliolink",
    "about",
    {
      path: "careerPreference",
      options: {
        limit: 1,
      },
      populate: [
        { path: "category", select: "-functionarea" },
        {
          path: "functionalarea",
          populate: [{ path: "industryid", select: "-category" }],
        },
        {
          path: "division",
          populate: { path: "cityid", select: "-divisionid" },
        },
        "jobtype",
        { path: "salaray.min_salary", select: "-other_salary" },
        { path: "salaray.max_salary", select: "-other_salary" },
      ],
    },
  ];

  if (isrecruiter == false) {
    // $or: [{ seekerid: currentid }, { type: 2 }]
    data = await Chat.find({ seekerid: currentid })
      .sort({ updatedAt: -1 })
      .populate([
        { path: "jobid", populate: populate, select: "-userid" },
        { path: "candidate_fullprofile", populate: populate2 },
        {
          path: "seekerid",
          select: [
            "other.online",
            "other.pushnotification",
            "other.lastfunctionalarea",
            "other.offlinedate",
            "fastname",
            "number",
            "secoundnumber",
            "fastname",
            "lastname",
            "image",
            "email",
          ],
          populate: { path: "other.lastfunctionalarea" },
        },
        {
          path: "recruiterid",
          select: [
            "number",
            "firstname",
            "lastname",
            "companyname",
            "designation",
            "image",
            "other.online",
            "other.pushnotification",
            "other.premium",
            "email",
            "other.offlinedate",
            "other.totaljob",
          ],
          populate: {
            path: "companyname",
            populate: [
              { path: "industry" },
              {
                path: "c_location.divisiondata",
                populate: { path: "cityid", select: "name" },
              },
            ],
          },
        },
        { path: "lastmessage" },
        { path: "bring_assis.bringlastmessage" },
        { path: "who_view_me.seekerviewid" },
        { path: "who_view_me.recruiterview" },
      ]);
  } else {
    data = await Chat.find({ recruiterid: currentid })
      .sort({ updatedAt: -1 })
      .populate([
        { path: "jobid", populate: populate, select: "-userid" },
        { path: "candidate_fullprofile", populate: populate2 },
        {
          path: "seekerid",
          select: [
            "other.online",
            "other.pushnotification",
            "other.lastfunctionalarea",
            "other.offlinedate",
            "fastname",
            "number",
            "secoundnumber",
            "fastname",
            "lastname",
            "image",
            "email",
          ],
          populate: { path: "other.lastfunctionalarea" },
        },
        {
          path: "recruiterid",
          select: [
            "number",
            "firstname",
            "lastname",
            "companyname",
            "designation",
            "image",
            "other.online",
            "other.pushnotification",
            "other.premium",
            "email",
            "other.offlinedate",
            "other.totaljob",
          ],
          populate: {
            path: "companyname",
            populate: [
              { path: "industry" },
              {
                path: "c_location.divisiondata",
                populate: { path: "cityid", select: "name" },
              },
            ],
          },
        },
        { path: "lastmessage" },
        { path: "bring_assis.bringlastmessage" },
        { path: "who_view_me.seekerviewid" },
        { path: "who_view_me.recruiterview", select: ["fastname", "lastname"] },
      ]);
  }
  return data;
}

async function SocketRoute(io) {
  io.on("connection", (socket) => {
    console.log("1 user connect");
    socket.on("assistent_create", async (data) => {
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
            title: "Unbolt Assistant",
            message1: "Hi, Jakaria! welcome to Unbolt!",
            message2: "You are now approve to reach more.",
            bringlastmessage: null,
          },
        });
        await channel.save();
        var message = {
          createdAt: new Date().getTime(),
          text: `Welcome to Unbolt! you are now approved to reach more! if there anything we can help you with, feel free to reach us at +88 01756175141 via WhatsApp.`,
        };
        var msg = await Message({ channel: channel._id, message: message });
        await msg.save();
        console.log(msg._id);
        console.log(channel._id);
        await Chat.findOneAndUpdate(
          { _id: channel._id },
          { $set: { "bring_assis.bringlastmessage": msg._id } }
        );
        console.log("bringin assistent create successfully");
        bring_assistent_notify_send(data.id, data.isrecruiter);
      } else {
        console.log("bringin assistent Already create successfully");
      }
    });

    socket.on("channelcreate", async (channel) => {
      var data = await Chat.findOne({
        seekerid: channel.seekerid,
        recruiterid: channel.recruiterid,
      }).populate([{ path: "seekerid" }, { path: "recruiterid" }]);
      if (data == null) {
        var channeldata = await Chat({
          seekerid: channel.seekerid,
          recruiterid: channel.recruiterid,
          date: new Date(),
        });
        channeldata.save();
        var channelinfo = await Chat.findOne({ _id: channeldata._id }).populate(
          [{ path: "seekerid" }]
        );
        io.emit("channeldata", channelinfo);
        io.sockets.in(channeldata._id).emit(`messagelistloading`, false);
      } else {
        io.emit("channeldata", data);
        io.sockets.in(data._id).emit(`messagelistloading`, false);
      }
    });

    // seekr and recruiter inter conversation list screen
    socket.on("channellist", async (channellist) => {
      console.log("user channl list rom join");
      socket.join(channellist.currentid);
      var data = await channellistdata(
        channellist.isrecruiter,
        channellist.currentid
      );
      io.sockets.in(channellist.currentid).emit("channellist", data);
      io.sockets.in(channellist.currentid).emit("channellistloading", false);
    });

    // channel join
    socket.on("channel", (channel) => {
      socket.join(channel);
      console.log(`chat room join a user ${channel}`);
    });

    // message list get
    socket.on("messagelist", async (channelid) => {
      var message = await Message.find({ channel: channelid });
      //     io.emit(`messagelist${channel}`, message)
      io.sockets.in(channelid.toString()).emit(`messagelist`, message);
      io.sockets.in(channelid.toString()).emit(`messagelistloading`, false);
    });

    //message snef
    socket.on("message", async (message) => {
      console.log("on message", message);
      socket.broadcast.to(message.channelid).emit("singlemsg", message);
      singlemessage(message, io);
    });

    // greating message
    socket.on("greating", async (message) => {
      Promise.all([singlemessage(message, io), greatingupdate(message)]);
      socket.broadcast.to(message.channelid).emit("singlemsg", message);
    });

    // imageupload
    socket.on("file_upload", async (filedata) => {
      fs.writeFileSync(`./uploads/${filedata.name}`, filedata.base64, {
        encoding: "base64",
      });
      var data = await Message({
        channel: filedata.channelid,
        message: filedata.message,
      });
      data.save();
      await Chat.findOneAndUpdate(
        { _id: filedata.channelid },
        { $set: { lastmessage: data } }
      );
      // io.sockets.in(filedata.channelid).emit("imageupload", data)
      socket.broadcast.to(filedata.channelid).emit("singlemsg", data);
      // chaneel list update
      var data2 = await channellistdata(
        false,
        data.message.user.customProperties["seekerid"]
      );
      io.sockets
        .in(data.message.user.customProperties["seekerid"])
        .emit("channellist", data2);
      var data3 = await channellistdata(
        true,
        data.message.user.customProperties["recruiterid"]
      );
      io.sockets
        .in(data.message.user.customProperties["recruiterid"])
        .emit("channellist", data3);

      // single_msg_notifiation(filedata.channelid, filedata.message.user.customProperties)
    });

    // block user
    socket.on("block_user", async (blockdata) => {
      await Chat.findOneAndUpdate(
        { _id: blockdata.channelid },
        {
          $set: {
            seekerblock: blockdata.seekerblock,
            recruiterblock: blockdata.recruiterblock,
          },
        }
      );
      io.sockets.in(blockdata.channelid).emit("block_user", blockdata);
    });

    // active detected
    socket.on("active", async (data) => {
      if (data["isrecruiter"] == true) {
        Promise.all([
          Recruiter.findOneAndUpdate(
            { _id: data["userid"] },
            { $set: { "other.online": true } }
          ),
        ]);
      } else {
        Promise.all([
          User.findOneAndUpdate(
            { _id: data["userid"] },
            { $set: { "other.online": true } }
          ),
        ]);
      }
    });

    // inactive detected
    socket.on("inactive", async (data) => {
      if (data["isrecruiter"] == true) {
        console.log(data);
        Promise.all([
          Recruiter.findOneAndUpdate(
            { _id: data["userid"] },
            {
              $set: {
                "other.online": false,
                "other.offlinedate": new Date().getTime(),
              },
            }
          ),
        ]);
      } else {
        Promise.all([
          User.findOneAndUpdate(
            { _id: data["userid"] },
            {
              $set: {
                "other.online": false,
                "other.offlinedate": new Date().getTime(),
              },
            }
          ),
        ]);
      }
    });

    // seeker inbox join
    socket.on("seeker_join", async (data) => {
      console.log(`seeker join done ${data.currentchannelid}`);
      io.sockets.in(data.currentchannelid).emit("seeker_join", true);
      await seekerseen(data.currentchannelid);
      var data2 = await channellistdata(false, data.seekerid);
      io.sockets.in(data.seekerid).emit("channellist", data2);
    });

    // seeker inbox leave
    socket.on("seeker_leave", (data) => {
      console.log(`seeker leave done ${data}`);
      io.sockets.in(data).emit("seeker_join", false);
      socket.leave(data);
    });

    // recruiter inbox join
    socket.on("recruiter_join", async (data) => {
      console.log(`recruiter join done ${data}`);
      io.sockets.in(data.currentchannelid).emit("recruiter_join", true);
      await recruiterseen(data.currentchannelid);
      var data1 = await channellistdata(true, data.recruiterid);
      io.sockets.in(data.recruiterid).emit("channellist", data1);
    });

    // recruiter inbox leave
    socket.on("recruiter_leave", (data) => {
      console.log(`recruiter leave done ${data}`);
      io.sockets.in(data).emit("recruiter_join", false);
      socket.leave(data);
    });

    // recruiter typing
    socket.on("recruiter_typing", (data) => {
      console.log(`recruiter typing ${JSON.stringify(data)}`);
      // io.sockets.in(data.channelid).emit("recruiter_typing", data.type)
      socket.broadcast.to(data.channelid).emit("recruiter_typing", data);
    });

    // seeker typing
    socket.on("seeker_typing", (data) => {
      console.log(`seeker typing ${JSON.stringify(data)}`);
      // io.sockets.in(data.channelid).emit("seeker_typing", data.type)
      socket.broadcast.to(data.channelid).emit("seeker_typing", data);
    });
  });

  io.on("disconnect", (socket) => {
    console.log("1 user disconnect");
  });
}

module.exports = SocketRoute;
