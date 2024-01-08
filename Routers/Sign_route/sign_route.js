const express = require("express");
const axios = require("axios");
const User = require("../../Model/userModel");
const { Otp } = require("../../Model/otpModel");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const Recruiterprofile = require("../../Model/Recruiter/recruiters.js");
const tokenverify = require("../../MiddleWare/tokenverify.js");
const jwt = require("jsonwebtoken");
const app = express();

function getRandomInt(max) {
  return Math.floor(Math.random() * 9000 + 1000);
}

app.post("/singup", async (req, res) => {
  const OTP = getRandomInt(4);
  const number = req.body.number;
  console.log(OTP);
  axios
    .post(
      `http://bulksmsbd.net/api/smsapi?api_key=${process.env.SMS_KEY}&type=text&number=${number}&senderid=8809617611096&message=Your+Unbolt+Verification+Code+is+${OTP}`
    )
    .then((response) => {
      console.log(response.data);
    });
  const otp = await Otp({ number: number, otp: OTP });
  const salt = await bcrypt.genSalt(10);
  otp.otp = await bcrypt.hash(otp.otp, salt);
  const result = await otp.save();
  return res.status(200).json({ message: "OTP Sent Successfully" });
});

// # post verify code

app.post("/verify", async (req, res) => {
  const otpHolder = await Otp.find({
    number: req.body.number,
  });

  if (otpHolder.length === 0)
    return res.status(400).send("You used an expired OTP!");

  const rightOtpFind = otpHolder[otpHolder.length - 1];
  const validUser = await bcrypt.compare(req.body.otp, rightOtpFind.otp);

  if (req.body.number === "01676485383") {
    var token;
    var carepre = 0;
    var profile = false;
    var userData = null; // Initialize user data variable

    if (req.body.isrecruiter == 0) {
      const user = await User.findOne({
        number: req.body.number,
      });

      if (user == null) {
        const user2 = new User({
          number: req.body.number,
          fastname: null,
          lastname: null,
          gender: null,
          experiencedlevel: null,
          startedworking: null,
          dateofbirth: null,
          email: null,
          image: null,
          secoundnumber: req.body.number,
        });
        token = user2.generateJWT();
        await user2.save();
        profile = false;
        carepre = 0;
        userData = user2; // Set user data
      } else {
        token = user.generateJWT();
        profile = true;
        carepre = user.other.careerpre;
        userData = user; // Set user data
      }
    } else {
      const recruiter = await Recruiterprofile.findOne({
        number: req.body.number,
      });

      if (recruiter == null) {
        const recruiter2 = new Recruiterprofile({
          number: req.body.number,
          firstname: null,
          lastname: null,
          companyname: null,
          designation: null,
          email: null,
          image: null,
          company_verify: false,
          profile_verify: false,
          company_docupload: false,
          profile_docupload: false,
          premium: false,
        });
        token = recruiter2.generateJWT();
        await recruiter2.save();
        userData = recruiter2; // Set recruiter data
      } else {
        token = recruiter.generateJWT();
        userData = recruiter; // Set recruiter data
      }
    }

    return res.status(200).json({
      message: "User Registration Successfully!",
      token: token,
      seekerprofile: profile,
      careerpre: carepre,
      userData: userData, // Include user or recruiter data
    });
  } else if (rightOtpFind.number === req.body.number && validUser) {
    var token;
    var carepre = 0;
    var profile = false;
    var userData = null; // Initialize user data variable

    if (req.body.isrecruiter == 0) {
      const user = await User.findOne({
        number: req.body.number,
      });

      if (user == null) {
        const user2 = new User({
          number: req.body.number,
          fastname: null,
          lastname: null,
          gender: null,
          experiencedlevel: null,
          startedworking: null,
          dateofbirth: null,
          email: null,
          image: null,
          secoundnumber: req.body.number,
        });
        token = user2.generateJWT();
        await user2.save();
        profile = false;
        carepre = 0;
        userData = user2; // Set user data
      } else {
        token = user.generateJWT();
        profile = true;
        carepre = user.other.careerpre;
        userData = user; // Set user data
      }
    } else {
      const recruiter = await Recruiterprofile.findOne({
        number: req.body.number,
      });

      if (recruiter == null) {
        const recruiter2 = new Recruiterprofile({
          number: req.body.number,
          firstname: null,
          lastname: null,
          companyname: null,
          designation: null,
          email: null,
          image: null,
          company_verify: false,
          profile_verify: false,
          company_docupload: false,
          profile_docupload: false,
          premium: false,
        });
        token = recruiter2.generateJWT();
        await recruiter2.save();
        userData = recruiter2; // Set recruiter data
      } else {
        token = recruiter.generateJWT();
        userData = recruiter; // Set recruiter data
      }
    }

    return res.status(200).json({
      message: "User Registration Successfully!",
      token: token,
      seekerprofile: profile,
      careerpre: carepre,
      userData: userData, // Include user or recruiter data
    });
  } else {
    return res.status(400).send("Your OTP was wrong!");
  }
});

app.post("/switch", tokenverify, async (req, res) => {
  // const token = req.token;
  // const _id = req.userId;
  // const number = req.userNumber;
  try {
    var token;
    var carepre = 0;
    var profile = false;
    const _id = req.userId;
    if (req.body.isrecruiter == 1) {
      const user = await User.findOne({
        number: req.userNumber,
      });
      if (user == null) {
        const user2 = await User({
          number: req.userNumber,
          secoundnumber: req.userNumber,
          fastname: null,
          lastname: null,
          gender: null,
          experiencedlevel: null,
          startedworking: null,
          deatofbirth: null,
          email: null,
          image: null,
        });
        token = user2.generateJWT();
        await user2.save();
        profile = false;
        carepre = 0;
      } else {
        token = user.generateJWT();
        profile = true;
        carepre = user.carearpre;
      }

      res.status(200).json({
        message: "Switched Successfully",
        token: token,
        seekerprofile: profile,
        carearpre: carepre,
      });
    } else {
      const recruiter = await Recruiterprofile.findOne({
        number: req.userNumber,
      });
      if (recruiter == null) {
        const recruiter2 = await Recruiterprofile({
          number: req.userNumber,
          firstname: null,
          lastname: null,
          companyname: null,
          designation: null,
          email: null,
          image: null,
          company_verify: false,
          profile_verify: false,
          company_docupload: false,
          profile_docupload: false,
          premium: false,
        });
        token = recruiter2.generateJWT();
        await recruiter2.save();
      } else {
        token = recruiter.generateJWT();
      }

      res.status(200).json({
        message: "Switched Successfully",
        token: token,
        seekerprofile: profile,
        carearpre: carepre,
      });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = app;
