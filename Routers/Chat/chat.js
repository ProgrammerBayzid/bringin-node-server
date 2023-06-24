const express = require("express");
const app = express();
const User = require("../../Model/userModel");
const tokenverify = require("../../MiddleWare/tokenverify.js");
const jwt = require("jsonwebtoken");
const Experince = require("../../Model/experience.js");
const { Chat, Message } = require("../../Model/Chat/chat")
const multer = require("multer");
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



async function SocketRoute(io) {
    io.on('connection', (socket) => {
        console.log("1 user connect")
        // socket.on('channelcreate', async (channel) => {
        //     console.log(channel)
        //     // channelcreate(channel, io)
        //     var data = await Chat.findOne({ seekerid: channel.seekerid, recruiterid: channel.recruiterid }).populate([{ path: "seekerid" }, { path: "recruiterid" }])
        //     if (data == null) {
        //         var channeldata = await Chat({ seekerid: channel.seekerid, recruiterid: channel.recruiterid, date: new Date() });
        //         channeldata.save();
        //         var channelinfo = await Chat.findOne({ _id: channeldata._id }).populate([{ path: "seekerid" }])
        //         io.emit("channeldata", channelinfo)
        //     } else {
        //         io.emit("channeldata", data)
        //     }
        // })

        // socket.on("channelid", async (channelid) => {
        //     console.log(channelid)
        //     socket.on(channelid.toString(), (message) => {
        //         messagesend(message, io, channelid)
        //     })
        //     var oldmessage = await Message.find({ channel: channelid })
        //     io.emit(`oldmessage${channelid}`, oldmessage)

        //     socket.on('disconnect', (data)=>{
        //         console.log("1 room disconnect")
        //     })
        // })


        socket.on("channellist", async (channellist) => {
            var channellistdata = await Chat.find({ seekerid: channellist }).populate([{ path: "seekerid" }, { path: "recruiterid" }])
            io.emit("channellist", channellistdata)
        })


        socket.on("channel", (channel) => {
            socket.on(`messagelist${channel}`, async (channelid) => {
                var message = await Message.find({ channel: channelid });
                io.emit(`messagelist${channel}`, message)
            })
            io.emit("channel", channel);
        })

      

        socket.on("1", async (message) => {
            // var data = await Message({ channel: message.channelid, message: message.message })
            // data.save()
            io.emit("1", message)
            // await Chat.findOneAndUpdate({ _id: message.channelid }, { $set: { lastmessage: data } })
        })


    })

    io.on('disconnect', (socket) => {
        console.log("1 user disconnect")
    })
}



async function channelcreate(channel, io) {

    // var data = await Chat.findOne({ seekerid: channel.seekerid, recruiterid: channel.recruiterid }).populate([{ path: "seekerid" }, { path: "recruiterid" }])
    // if (data == null) {
    //     var channeldata = await Chat({ seekerid: channel.seekerid, recruiterid: channel.recruiterid, date: new Date() });
    //     channeldata.save();
    //     var channelinfo = await Chat.findOne({ _id: channeldata._id }).populate([{ path: "seekerid" }])
    //     io.emit("channeldata", channelinfo)
    // } else {
    //     io.emit("channeldata", data)
    // }
}



async function messagesend(message, io, channelid) {
    // var messagedata = await Message.findOne({ channel: message.channelid }, { $push: { message: message.message } })
    // if (messagedata == null) {

    // } else {
    //     io.emit(channelid, messagedata)
    // }

    var data = await Message({ channel: message.channelid, message: message.message })
    data.save()
    io.emit(channelid, data)
    await Chat.findOneAndUpdate({ _id: message.channelid }, { $set: { lastmessage: data } })


}




module.exports = SocketRoute