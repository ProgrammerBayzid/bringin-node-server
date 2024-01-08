const express = require("express");
const app = express();
const multer = require("multer");

const { Cv } = require("../../Model/adminprofiledetails");

const tokenverify = require("../../MiddleWare/tokenverify.js");
const jwt = require("jsonwebtoken");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "cvs");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname);
  },
});
const cv = multer({ storage: storage });

// cv post api

app.post("/cv", tokenverify, cv.single("cv"), async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;
    const cvdata = await Cv({
      cv: req.file.path,
      userid: _id,
    });
    const cvfile = await cvdata.save();
    res.status(200).send(cvfile);
  } catch (error) {
    res.status(400).send(error);
  }
});

// cv get api

app.get("/cv/:_id", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;
    const data = await Cv.findOne({ userid: _id });
    res.send(data);
  } catch (error) {
    res.send(error);
  }
});

module.exports = app;
