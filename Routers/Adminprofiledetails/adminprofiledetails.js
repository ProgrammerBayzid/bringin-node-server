const express = require("express");
const app = express();
const multer = require("multer");
const Profiledata = require("../../Model/Seeker_profile_all_details.js");
const mongoose = require("mongoose");

const {
  AdminCompanySize,
  AdminSkill,
  JobTitle,
  Department,
  SeekeraddCompany,
  Image,
  Cv,
} = require("../../Model/adminprofiledetails");
const { City, Division } = require("../../Model/alllocation.js");
const Experince = require("../../Model/experience.js");
const {
  Company,
  Companysize,
} = require("../../Model/Recruiter/Company/company.js");

const tokenverify = require("../../MiddleWare/tokenverify.js");
const jwt = require("jsonwebtoken");
const redis = require("../../utils/redis.js");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname);
  },
});
const image = multer({ storage: storage });

app.post("/admin_exprience", async (req, res) => {
  try {
    const Data = await Experince(req.body);
    const ex = await Data.save();
    res.status(200).send(ex);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/admin_exprience", async (req, res) => {
  try {
    const data = await Experince.find().sort("sortOrder");
    res.send(data);
  } catch (error) {
    res.send(error);
  }
});
//sort area bulk update
app.patch("/admin/exprience_update_bulk", async (req, res) => {
  try {
    var updateData = req.body;

    console.log(updateData);

    const bulkUpdateOperations = updateData.map(({ id, sortOrder }) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(id) },
        update: { $set: { sortOrder } },
      },
    }));
    await Experince.bulkWrite(bulkUpdateOperations);

    res.status(200).json({ message: "update successfull" });
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});

app.patch("/experince_update/:_id", async (req, res) => {
  try {
    const _id = req.params._id;
    await Experince.findByIdAndUpdate(
      _id,
      {
        $set: {
          name: req.body.name,
        },
      },
      {
        new: true,
      }
    );

    res.status(200).json({ message: "update successfull" });
  } catch (error) {
    res.status(404).send(error);
  }
});

app.delete("/admin_exprience/:id", async (req, res) => {
  try {
    const result = await Experince.findByIdAndDelete(req.params.id);
    if (!req.params.id) {
      return res.status(404).send();
    }
    res.send(result);
  } catch (error) {
    res.send(error);
  }
});

// # post designation data

app.post("/jobtitle", async (req, res) => {
  try {
    const designationData = await JobTitle(req.body);
    const data = await designationData.save();
    res.status(200).send(data);
  } catch (error) {
    res.status(400).send(error);
  }
});

// # get designation data

app.get("/jobtitle", async (req, res) => {
  try {
    const data = await JobTitle.find();
    res.send(data);
  } catch (error) {
    res.send(error);
  }
});

app.patch("/jobtitle_update/:_id", async (req, res) => {
  try {
    const _id = req.params._id;
    await JobTitle.findByIdAndUpdate(
      _id,
      {
        $set: {
          name: req.body.name,
        },
      },
      {
        new: true,
      }
    );

    res.status(200).json({ message: "update successfull" });
  } catch (error) {
    res.status(404).send(error);
  }
});

app.delete("/jobtitle/:id", async (req, res) => {
  try {
    const result = await JobTitle.findByIdAndDelete(req.params.id);
    if (!req.params.id) {
      return res.status(404).send();
    }
    res.send(result);
  } catch (error) {
    res.send(error);
  }
});

// # post department data

app.post("/department", async (req, res) => {
  try {
    const departmentData = await Department(req.body);
    const data = await departmentData.save();
    res.status(200).send(data);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.patch("/department_update/:_id", async (req, res) => {
  try {
    const _id = req.params._id;
    await Department.findByIdAndUpdate(
      _id,
      {
        $set: {
          name: req.body.name,
        },
      },
      {
        new: true,
      }
    );

    res.status(200).json({ message: "update successfull" });
  } catch (error) {
    res.status(404).send(error);
  }
});
// # get department data

app.get("/department", async (req, res) => {
  try {
    const data = await Department.find();
    res.send(data);
  } catch (error) {
    res.send(error);
  }
});
app.delete("/department/:id", async (req, res) => {
  try {
    const result = await Department.findByIdAndDelete(req.params.id);
    if (!req.params.id) {
      return res.status(404).send();
    }
    res.send(result);
  } catch (error) {
    res.send(error);
  }
});

// # post institutename data

// app.post("/admincompanysize", async (req, res) => {
//     try {
//       const admincompanysizeData = await Companysize(req.body);
//       const data = await admincompanysizeData.save()
//       res.status(200).send(data);
//     } catch (error) {
//       res.status(400).send(error);
//     }
//   });

// # get Institutename data

app.get("/admincompanysize", async (req, res) => {
  try {
    const cacheKey = `admincompanysize`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log("sending data from redis");
      return res.status(200).json(JSON.parse(cachedData));
    }
    const admincompanysizeData = await Companysize.find().sort("sortOrder");
    res.send(admincompanysizeData);
    redis.set(cacheKey, JSON.stringify(admincompanysizeData), 60 * 60 * 24 * 7);
  } catch (error) {
    res.send(error);
  }
});
//sort area bulk update
app.patch("/admin/companysize_update_bulk", async (req, res) => {
  try {
    var updateData = req.body;

    console.log(updateData);

    const bulkUpdateOperations = updateData.map(({ id, sortOrder }) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(id) },
        update: { $set: { sortOrder } },
      },
    }));
    await Companysize.bulkWrite(bulkUpdateOperations);
    const cacheKey = `admincompanysize`;
    await redis.del(cacheKey);
    res.status(200).json({ message: "update successfull" });
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});
app.patch("/company_size_update/:_id", async (req, res) => {
  try {
    const _id = req.params._id;
    await Companysize.findByIdAndUpdate(
      _id,
      {
        $set: {
          size: req.body.size,
        },
      },
      {
        new: true,
      }
    );
    const cacheKey = `admincompanysize`;
    await redis.del(cacheKey);
    res.status(200).json({ message: "update successfull" });
  } catch (error) {
    res.status(404).send(error);
  }
});

app.delete("/admincompanysize/:id", async (req, res) => {
  try {
    const result = await AdminCompanySize.Companysize(req.params.id);
    if (!req.params.id) {
      return res.status(404).send();
    }
    const cacheKey = `admincompanysize`;
    await redis.del(cacheKey);
    res.send(result);
  } catch (error) {
    res.send(error);
  }
});

// # post company data

app.post("/seekercompany", async (req, res) => {
  try {
    const companyData = await SeekeraddCompany(req.body);
    const data = await companyData.save();
    res.status(200).send(data);
  } catch (error) {
    res.status(400).send(error);
  }
});

// # get company data

app.get("/seekercompany", async (req, res) => {
  try {
    //get query parameter
    const name = req?.query?.name;

    // console.log(name);
    if (name) {
      //regex for search
      const data = await SeekeraddCompany.find({
        name: { $regex: name, $options: "i" },
      });
      return res.send(data);
    }

    const data = await SeekeraddCompany.find();

    res.send(data);
  } catch (error) {
    res.send(error);
  }
});

app.patch("/company_name_update/:_id", async (req, res) => {
  try {
    const _id = req.params._id;
    await SeekeraddCompany.findByIdAndUpdate(
      _id,
      {
        $set: {
          name: req.body.name,
        },
      },
      {
        new: true,
      }
    );

    res.status(200).json({ message: "update successfull" });
  } catch (error) {
    res.status(404).send(error);
  }
});

app.delete("/seekercompany/:id", async (req, res) => {
  try {
    const result = await SeekeraddCompany.findByIdAndDelete(req.params.id);
    if (!req.params.id) {
      return res.status(404).send();
    }
    res.send(result);
  } catch (error) {
    res.send(error);
  }
});

// image post api

app.post("/image", tokenverify, image.single("image"), async (req, res) => {
  try {
    const _id = req.userId;
    const imagedata = await Image({
      image: req.file.path,
      userid: _id,
    });
    const imagefile = await imagedata.save();
    res.status(200).send(imagefile);
  } catch (error) {
    res.status(400).send(error);
  }
});

// image get api

app.get("/image/:_id", tokenverify, async (req, res) => {
  try {
    const _id = req.userId;
    const data = await Image.findOne({ userid: _id });
    res.send(data);
  } catch (error) {
    res.send(error);
  }
});

app.post("/admin/skill", async (req, res) => {
  try {
    const skillData = await AdminSkill(req.body);
    const data = await skillData.save();
    res.status(200).send(data);
  } catch (error) {
    res.status(400).send(error);
  }
});

// # get skill data

app.get("/admin/skill", async (req, res) => {
  try {
    const data = await AdminSkill.find();
    res.send(data);
  } catch (error) {
    res.send(error);
  }
});

app.patch("/skill_update/:_id", async (req, res) => {
  try {
    const _id = req.params._id;
    await AdminSkill.findByIdAndUpdate(
      _id,
      {
        $set: {
          name: req.body.name,
        },
      },
      {
        new: true,
      }
    );

    res.status(200).json({ message: "update successfull" });
  } catch (error) {
    res.status(404).send(error);
  }
});

app.delete("/admin/skill/:id", async (req, res) => {
  try {
    const result = await AdminSkill.findByIdAndDelete(req.params.id);
    if (!req.params.id) {
      return res.status(404).send();
    }
    res.send(result);
  } catch (error) {
    res.send(error);
  }
});

app.get("/job/report/candidate", async (req, res) => {
  const _id = req.query._id;
  const candidate = { _id: _id };
  try {
    const data = await Profiledata.findOne(candidate);
    res.send(data);
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error(error);
    res
      .status(500)
      .send("An error occurred while retrieving the profile data.");
  }
});

module.exports = app;
