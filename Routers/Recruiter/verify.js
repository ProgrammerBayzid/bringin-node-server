const express = require("express");
const app = express();
const Recruiters = require("../../Model/Recruiter/recruiters");
const tokenverify = require("../../MiddleWare/tokenverify.js");
const jwt = require("jsonwebtoken");
const { Otp } = require("../../Model/otpModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const smtppool = require("nodemailer");
const {
  CompanyVerify,
} = require("../../Model/Recruiter/Verify/company_verify.js");
const {
  ProfileVerify,
} = require("../../Model/Recruiter/Verify/profile_verify.js");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const transportar = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  auth: {
    user: "hello@unbolt.co",
    pass: "@r1o1n1y1F",
  },
});

function getRandomInt(max) {
  return Math.floor(Math.random() * 9000 + 1000);
}

const multer = require("multer");
const CongratulationsMail = require("./EmailTemolete/email_congratulation_templete");
const otpMail = require("./EmailTemolete/email_otp_templete");
const {
  verirySuccessMassagesend,
  documentSubmitSuccessMassagesend,
  createAssistant,
} = require("../Notification/notification");
const { Chat } = require("../../Model/Chat/chat");
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

app.post(
  "/company_verify",
  tokenverify,
  upload.single("image"),
  async (req, res) => {
    try {
      const token = req.token;
      const _id = req.userId;
      var verifydata = await CompanyVerify.findOne({ userid: _id });

      if (verifydata == null) {
        await CompanyVerify({
          userid: _id,
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          encoding: req.file.encoding,
          mimetype: req.file.mimetype,
          destination: req.file.destination,
          filename: req.file.filename,
          path: req.file.path,
          size: req.file.size,
        }).save();
        await Recruiters.findByIdAndUpdate(
          { _id: _id },
          { $set: { "other.company_docupload": true } }
        );
        res.status(200).send("File uploaded successfully");
      } else {
        await CompanyVerify.findOneAndUpdate(
          { userid: _id },
          {
            $set: {
              fieldname: req.file.fieldname,
              originalname: req.file.originalname,
              encoding: req.file.encoding,
              mimetype: req.file.mimetype,
              destination: req.file.destination,
              filename: req.file.filename,
              path: req.file.path,
              size: req.file.size,
            },
          }
        );
        await Recruiters.findByIdAndUpdate(
          { _id: _id },
          { $set: { "other.company_docupload": true } }
        );
        res.status(200).send("File uploaded successfully");
      }
    } catch (error) {
      res.status(404).send(error);
    }
  }
);

// recruter profile verify with link
app.post(
  "/profile_verify_link",
  tokenverify,
  upload.single("image"),

  async (req, res) => {
    try {
      const token = req.token;
      const _id = req.userId;

      var verifydata = await ProfileVerify.findOne({ userid: _id });
      if (verifydata == null) {
        ProfileVerify({
          userid: _id,
          fieldname: null,
          originalname: null,
          encoding: null,
          mimetype: null,
          destination: null,
          filename: null,
          path: null,
          size: 0,
          type: 3,
          link: req.body.link,
        }).save();
        await Recruiters.findByIdAndUpdate(
          { _id: _id },
          {
            $set: {
              "other.profile_docupload": true,
              "other.profile_other_docupload": true,
              "other.profile_verify_type": 3,
            },
          }
        );
        var oldChanneldata = await Chat.find({
          bring_assis: { $ne: null },
          recruiterid: { $in: _id },
        });
        if (oldChanneldata.length === 0 || oldChanneldata === null) {
          await createAssistant({
            id: _id,
            isrecruiter: true,
            email: false,
          });
        } else {
          await documentSubmitSuccessMassagesend(_id);
        }
        res.status(200).send("Send successfully");
      } else {
        await ProfileVerify.findOneAndUpdate(
          { userid: _id },
          {
            $set: {
              fieldname: null,
              originalname: null,
              encoding: null,
              mimetype: null,
              destination: null,
              filename: null,
              path: null,
              size: 0,
              type: 3,
              link: req.body.link,
            },
          }
        );
        await Recruiters.findByIdAndUpdate(
          { _id: _id },
          {
            $set: {
              "other.profile_docupload": true,
              "other.profile_other_docupload": true,
              "other.profile_verify_type": 3,
            },
          }
        );
        var oldChanneldata = await Chat.find({
          bring_assis: { $ne: null },
          recruiterid: { $in: _id },
        });
        if (oldChanneldata.length === 0 || oldChanneldata === null) {
          await createAssistant({
            id: _id,
            isrecruiter: true,
            email: false,
          });
        } else {
          await documentSubmitSuccessMassagesend(_id);
        }
        res.status(200).send("Send successfully");
      }
    } catch (error) {
      res.status(404).send(error);
    }
  }
);

// recruter profile verify with document

app.post(
  "/profile_verify_document",
  tokenverify,
  upload.single("image"),

  async (req, res) => {
    try {
      const token = req.token;
      const _id = req.userId;
      console.log("_id", _id);
      var verifydata = await ProfileVerify.findOne({ userid: _id });
      if (verifydata == null) {
        ProfileVerify({
          userid: _id,
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          encoding: req.file.encoding,
          mimetype: req.file.mimetype,
          destination: req.file.destination,
          filename: req.file.filename,
          path: req.file.path,
          size: req.file.size,
          type: 3,
          link: "",
        }).save();
        await Recruiters.findByIdAndUpdate(
          { _id: _id },
          {
            $set: {
              "other.profile_docupload": true,
              "other.profile_other_docupload": true,
              "other.profile_verify_type": 3,
            },
          }
        );
        var oldChanneldata = await Chat.find({
          bring_assis: { $ne: null },
          recruiterid: { $in: _id },
        });
        if (oldChanneldata.length === 0 || oldChanneldata === null) {
          await createAssistant({
            id: _id,
            isrecruiter: true,
            email: false,
          });
        } else {
          await documentSubmitSuccessMassagesend(_id);
        }
        return res.status(200).send("Document Send successfully");
      } else {
        await ProfileVerify.findOneAndUpdate(
          { userid: _id },
          {
            $set: {
              fieldname: req.file.fieldname,
              originalname: req.file.originalname,
              encoding: req.file.encoding,
              mimetype: req.file.mimetype,
              destination: req.file.destination,
              filename: req.file.filename,
              path: req.file.path,
              size: req.file.size,
              type: 3,
              link: "",
            },
          }
        );
        await Recruiters.findByIdAndUpdate(
          { _id: _id },
          {
            $set: {
              "other.profile_docupload": true,
              "other.profile_other_docupload": true,
              "other.profile_verify_type": 3,
            },
          }
        );
        var oldChanneldata = await Chat.find({
          bring_assis: { $ne: null },
          recruiterid: { $in: _id },
        });
        if (oldChanneldata.length === 0 || oldChanneldata === null) {
          await createAssistant({
            id: _id,
            isrecruiter: true,
            email: false,
          });
        } else {
          await documentSubmitSuccessMassagesend(_id);
        }
        res.status(200).send(" Document Send successfully");
      }
    } catch (error) {
      res.status(404).send(error);
    }
  }
);

// recruter profile verify with email

app.post(
  "/profile_verify_email",
  tokenverify,
  upload.single("image"),

  async (req, res) => {
    try {
      const _id = req.userId;
      const number = req.userNumber;

      var OTP = getRandomInt(4);
      console.log(OTP);
      const otp = await Otp({ number: number, otp: OTP });
      const salt = await bcrypt.genSalt(10);
      otp.otp = await bcrypt.hash(otp.otp, salt);
      await otp.save();
      var recruiter = await Recruiters.findOne({ _id: _id });
      console.log(req.body);
      const msg = {
        to: req.body.email, // Change to your recipient
        from: "hello@unbolt.co", // Change to your verified sender
        subject: `Unbolt Account Verification Code`,
        text: `Otp is ${OTP}`,
        html: otpMail(OTP),
      };
      transportar.sendMail(msg, async (err) => {
        if (err) {
          return res.status(400).send(err);
        } else {
          await Recruiters.findByIdAndUpdate(
            { _id: _id },
            {
              $set: {
                email: req.body.email,
              },
            }
          );
          res.status(200).send("Verification code send successfully");
        }
      });
    } catch (error) {
      res.status(404).send(error);
    }
  }
);

app.post(
  "/profile_verify",
  tokenverify,
  upload.single("image"),

  async (req, res) => {
    try {
      const token = req.token;
      const _id = req.userId;
      const number = req.userNumber;
      if (req.body.type == 1) {
        var OTP = getRandomInt(4);
        console.log(OTP);
        const otp = await Otp({ number: number, otp: OTP });
        const salt = await bcrypt.genSalt(10);
        otp.otp = await bcrypt.hash(otp.otp, salt);
        await otp.save();
        var recruiter = await Recruiters.findOne({ _id: _id });

        let recruitername = `${recruiter?.firstname} ${recruiter?.lastname}`;

        const msg = {
          to: req.body.email, // Change to your recipient
          from: "hello@unbolt.co", // Change to your verified sender
          subject: `Unbolt Account Verification Code`,
          text: `Otp is ${OTP}`,
          html: otpMail(OTP),
        };
        transportar.sendMail(msg, async (err) => {
          if (err) {
            return res.status(400).send(err);
          } else {
            await Recruiters.findByIdAndUpdate(
              { _id: _id },
              {
                $set: {
                  email: req.body.email,
                },
              }
            );
            res.status(200).send("Verification code send successfully");
          }
        });
      } else if (req.body.type == 5) {
        var verifydata = await ProfileVerify.findOne({ userid: _id });
        if (verifydata == null) {
          ProfileVerify({
            userid: _id,
            fieldname: null,
            originalname: null,
            encoding: null,
            mimetype: null,
            destination: null,
            filename: null,
            path: null,
            size: 0,
            type: req.body.type,
            link: req.body.link,
          }).save();
          await Recruiters.findByIdAndUpdate(
            { _id: _id },
            {
              $set: {
                "other.profile_docupload": true,
                "other.profile_other_docupload": true,
                "other.profile_verify_type": req.body.type,
              },
            }
          );
          var oldChanneldata = await Chat.find({
            bring_assis: { $ne: null },
            recruiterid: { $in: _id },
          });
          if (oldChanneldata.length === 0 || oldChanneldata === null) {
            await createAssistant({
              id: _id,
              isrecruiter: true,
              email: false,
            });
          } else {
            await documentSubmitSuccessMassagesend(_id);
          }
          res.status(200).send("Send successfully");
        } else {
          await ProfileVerify.findOneAndUpdate(
            { userid: _id },
            {
              $set: {
                fieldname: null,
                originalname: null,
                encoding: null,
                mimetype: null,
                destination: null,
                filename: null,
                path: null,
                size: 0,
                type: req.body.type,
                link: req.body.link,
              },
            }
          );
          await Recruiters.findByIdAndUpdate(
            { _id: _id },
            {
              $set: {
                "other.profile_docupload": true,
                "other.profile_other_docupload": true,
                "other.profile_verify_type": req.body.type,
              },
            }
          );

          var oldChanneldata = await Chat.find({
            bring_assis: { $ne: null },
            recruiterid: { $in: _id },
          });
          if (oldChanneldata.length === 0 || oldChanneldata === null) {
            await createAssistant({
              id: _id,
              isrecruiter: true,
              email: false,
            });
          } else {
            await documentSubmitSuccessMassagesend(_id);
          }
          res.status(200).send("Send successfully");
        }
      } else {
        var verifydata = await ProfileVerify.findOne({ userid: _id });
        if (verifydata == null) {
          ProfileVerify({
            userid: _id,
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            encoding: req.file.encoding,
            mimetype: req.file.mimetype,
            destination: req.file.destination,
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size,
            type: req.body.type,
            link: "",
          }).save();
          await Recruiters.findByIdAndUpdate(
            { _id: _id },
            {
              $set: {
                "other.profile_docupload": true,
                "other.profile_other_docupload": true,
                "other.profile_verify_type": req.body.type,
              },
            }
          );
          var oldChanneldata = await Chat.find({
            bring_assis: { $ne: null },
            recruiterid: { $in: _id },
          });
          if (oldChanneldata.length === 0 || oldChanneldata === null) {
            await createAssistant({
              id: _id,
              isrecruiter: true,
              email: false,
            });
          } else {
            await documentSubmitSuccessMassagesend(_id);
          }
          return res.status(200).send("Send successfully");
        } else {
          await ProfileVerify.findOneAndUpdate(
            { userid: _id },
            {
              $set: {
                fieldname: req.file.fieldname,
                originalname: req.file.originalname,
                encoding: req.file.encoding,
                mimetype: req.file.mimetype,
                destination: req.file.destination,
                filename: req.file.filename,
                path: req.file.path,
                size: req.file.size,
                type: req.body.type,
                link: "",
              },
            }
          );
          await Recruiters.findByIdAndUpdate(
            { _id: _id },
            {
              $set: {
                "other.profile_docupload": true,
                "other.profile_other_docupload": true,
                "other.profile_verify_type": req.body.type,
              },
            }
          );
          var oldChanneldata = await Chat.find({
            bring_assis: { $ne: null },
            recruiterid: { $in: _id },
          });
          if (oldChanneldata.length === 0 || oldChanneldata === null) {
            await createAssistant({
              id: _id,
              isrecruiter: true,
              email: false,
            });
          } else {
            await documentSubmitSuccessMassagesend(_id);
          }
          res.status(200).send("Send successfully");
        }
      }
    } catch (error) {
      res.status(404).send(error);
    }
  }
);

app.post("/email_code_verify", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;
    const number = req.userNumber;

    const otpHolder = await Otp.find({
      number: number,
    });
    if (otpHolder.length === 0)
      return res.status(400).send("You use an Expired OTP!");
    const rightOtpFind = otpHolder[otpHolder.length - 1];
    const validUser = await bcrypt.compare(req.body.otp, rightOtpFind.otp);
    if (rightOtpFind.number === number && validUser) {
      const OTPDelete = await Otp.deleteMany({
        number: rightOtpFind.number,
      });
      const recruter = await Recruiters.findOne({ _id: _id });
      await Recruiters.findByIdAndUpdate(
        { _id: _id },
        {
          $set: {
            "other.profile_verify": true,
            "other.company_verify": true,
            "other.profile_verify_type": 1,
          },
        }
      );

      var oldChanneldata = await Chat.find({
        bring_assis: { $ne: null },
        recruiterid: { $in: _id },
      });
      console.log("oldChanneldata", oldChanneldata);
      if (oldChanneldata.length === 0 || oldChanneldata === null) {
        await createAssistant({
          id: _id,
          isrecruiter: true,
          email: true,
        });
      } else {
        await verirySuccessMassagesend(_id);
      }

      const mailoption = {
        to: recruter.email, // Change to your recipient
        from: "hello@unbolt.co", // Change to your verified sender
        subject: "Congratulations! on Joining Unbolt",
        html: CongratulationsMail,
      };
      transportar.sendMail(mailoption, async (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          res.status(500).json({ message: "Error sending email" });
        } else {
          await Recruiters.findByIdAndUpdate(
            { _id: _id },
            { $set: { "other.profile_docupload": true } }
          );
          console.log("Email sent:", info.response);
        }
      });

      return res.status(200).json({
        message: "Verified successfully",
      });
    } else {
      return res.status(400).send("Your OTP was wrong!");
    }
  } catch (error) {
    res.status(404).send(error);
  }
});

// Define your route to send the verification email
app.post("/admin_recruter_profile_verify_email", async (req, res) => {
  try {
    // Extract email from the request body
    const { email } = req.body;

    const mailOption = {
      from: "hello@unbolt.co",
      to: email,
      subject: "Congratulations! on Joining Unbolt",
      html: CongratulationsMail,
    };

    // Send the verification email
    transportar.sendMail(mailOption, (error) => {
      if (error) {
        console.error("Error sending email:", error);
        res.status(400).send("Error sending email");
      } else {
        console.log("Verification email sent successfully");
        res.status(200).send("Verification successfully");
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal server error");
  }
});

module.exports = app;
