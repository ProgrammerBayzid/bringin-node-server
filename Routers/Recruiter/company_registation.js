const express = require("express");
const app = express();
const Recruiters = require("../../Model/Recruiter/recruiters");
const tokenverify = require("../../MiddleWare/tokenverify.js");
const jwt = require("jsonwebtoken");
const {
  Company,
  Companysize,
} = require("../../Model/Recruiter/Company/company.js");

const multer = require("multer");
const redis = require("../../utils/redis");
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

app.post("/companySize_add", async (req, res) => {
  var companysize = await Companysize.findOne({
    size: req.body.size,
  });
  if (companysize == null) {
    await Companysize({ size: req.body.size }).save();
    const cacheKey = `admincompanysize`;
    await redis.del(cacheKey);
    res.json({ message: "Company size add successfully" });
  } else {
    res.json({ message: "company size already added" });
  }
});

app.get("/companySize", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;
    const cacheKey = `companySize`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log("sending data from redis");
      return res.status(200).json(JSON.parse(cachedData));
    }
    var companysize = await Companysize.find().sort("sortOrder");
    res.status(200).send(companysize);
    redis.set(cacheKey, JSON.stringify(companysize), 60 * 60 * 24 * 7);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post("/company", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;
    var company = await Company.findOne({ userid: _id });
    if (company != null) {
      await Company.findOneAndUpdate(
        { userid: _id },
        {
          $set: req.body,
        }
      );
      console.log(company._id);
      await Recruiters.findOneAndUpdate(
        { _id: _id },
        { $set: { companyname: company._id } }
      );
      res.status(200).send("Company registation updated successfully");
    } else {
      var data = await Company({
        userid: _id,
        legal_name: req.body.legal_name,
        sort_name: req.body.sort_name,
        industry: req.body.industry,
        c_size: req.body.c_size,
        c_location: req.body.c_location,
        c_website: req.body.c_website,
      });
      data.save();
      console.log(data._id);
      await Recruiters.findOneAndUpdate(
        { _id: _id },
        { $set: { companyname: data._id } }
      );
      res.status(200).send("Company registation Add successfully");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});
app.post("/adminPanel_company_register/:_id", tokenverify, async (req, res) => {
  try {
    const _id = req.params._id;
    var company = await Company.findOne({ userid: _id });
    if (company != null) {
      await Company.findOneAndUpdate(
        { userid: _id },
        {
          $set: req.body,
        }
      );
      console.log(company._id);
      await Recruiters.findOneAndUpdate(
        { _id: _id },
        { $set: { companyname: company._id } }
      );
      res.status(200).send("Company registation updated successfully");
    } else {
      var data = await Company({
        userid: _id,
        legal_name: req.body.legal_name,
        sort_name: req.body.sort_name,
        industry: req.body.industry,
        c_size: req.body.c_size,
        c_location: req.body.c_location,
        c_website: req.body.c_website,
      });
      data.save();
      console.log(data._id);
      await Recruiters.findOneAndUpdate(
        { _id: _id },
        { $set: { companyname: data._id } }
      );
      res.status(200).send("Company registation Add successfully");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});
app.get("/company", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;

    var company = await Company.findOne({ userid: _id }).populate([
      {
        path: "c_location",
        populate: [
          {
            path: "divisiondata",
            select: "",
            populate: [{ path: "cityid", select: "" }],
          },
        ],
      },
      "c_size",
      "industry",
      "c_size",
    ]);
    if (company == null) {
      res.status(200).send(
        Company({
          userid: _id,
          legal_name: null,
          sort_name: null,
          industry: null,
          c_size: null,
          c_location: {
            lat: 0,
            lon: 0,
            formet_address: "",
            city: "",
          },
          c_website: null,
        })
      );
    } else {
      res.status(200).send(company);
    }
  } catch (error) {
    res.status(400).send(error);
  }
});
app.get("/adminPanel_company/:_id", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const _id = req.params._id;

    var company = await Company.findOne({ userid: _id }).populate([
      {
        path: "c_location",
        populate: [
          {
            path: "divisiondata",
            select: "",
            populate: [{ path: "cityid", select: "" }],
          },
        ],
      },
      "c_size",
      "industry",
      "c_size",
    ]);
    if (company == null) {
      res.status(200).send(
        Company({
          userid: _id,
          legal_name: null,
          sort_name: null,
          industry: null,
          c_size: null,
          c_location: {
            lat: 0,
            lon: 0,
            formet_address: "",
            city: "",
          },
          c_website: null,
        })
      );
    } else {
      res.status(200).send(company);
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post("/company_search", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const _id = req.userId;
    var company = await Company.find({
      legal_name: { $regex: req.body.search, $options: "i" },
    }).populate(["industry", "c_size"]);
    res.status(200).send(company);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = app;
