const express = require("express");
const app = express();

const { JobSearchingStatus } = require("../../Model/jobSearchingStatus");

const tokenverify = require("../../MiddleWare/tokenverify.js");
const jwt = require("jsonwebtoken");

app.post("/jobSearchingStatus", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;
    const data = await JobSearchingStatus({
      jobhuntingstatus: req.body.jobhuntingstatus,
      morestatus: req.body.morestatus,
      lookingforanyjob: req.body.lookingforanyjob,
      userid: _id,
    });
    const jobSearchingData = await data.save();
    res.status(200).send(jobSearchingData);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/jobSearchingStatus/:_id", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;
    const data = await JobSearchingStatus.find({ userid: _id });
    res.send(data);
  } catch (error) {
    res.send(error);
  }
});

app.put("/jobSearchingStatus/:id", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;
    const filter = { userid: _id };
    const options = { upsert: true };
    const update = {
      $set: {
        lookingforanyjob: "true",
      },
    };
    const result = await JobSearchingStatus.updateOne(filter, update, options);
    res.send(result);
  } catch (error) {
    res.send(error);
  }
});

module.exports = app;
