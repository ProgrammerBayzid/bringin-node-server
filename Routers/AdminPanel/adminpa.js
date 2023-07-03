const express = require("express");
const app = express();

const {
  Expertisearea,
  Category,
  Functionarea,
} = require("../../Model/industry.js");
const Recruiters = require("../../Model/Recruiter/recruiters");

const JobReport = require("../../Model/job_report.js");

const { City, Division } = require("../../Model/alllocation.js");
const { Jobtype } = require("../../Model/jobtype.js");
const { Salirietype } = require("../../Model/salarie.js");
const {} = require("../../Model/Seeker_profile_all_details.js");
const Experince = require("../../Model/experience.js");
const {
  EducationLavel,
  Digree,
  Subject,
} = require("../../Model/education_lavel.js");
const candidateReport = require("../../Model/Recruiter/Candidate_Report/candidate_report");
const {
  CompanyVerify,
} = require("../../Model/Recruiter/Verify/company_verify.js");
const {
  ProfileVerify,
} = require("../../Model/Recruiter/Verify/profile_verify.js");

// repoted candidate get
app.get("/candidate_report", async (req, res) => {
  try {
    var data = await candidateReport.find().populate("candidateid");
    res.status(200).json(data);
  } catch (error) {
    res.status(400).send(error);
  }
});
app.get("/candidate_report/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: id };
  const candidate = await candidateReport
    .findOne(query)
    .populate("candidateid");
  res.send(candidate);
});

//  job_report get
app.get("/job_report", async (req, res) => {
  try {
    var data = await JobReport.find().populate("jobid");
    res.status(200).json(data);
  } catch (error) {
    res.status(400).send(error);
  }
});
app.get("/job_report/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: id };
  const candidate = await JobReport.findOne(query).populate("jobid");
  res.send(candidate);
});

app.get("/premium_user", async (req, res) => {
  try {
    const premium = req.query.premium;
    const filter = { premium: premium === "true" };
    var data = await Recruiters.find(filter);
    res.status(200).json(data);
  } catch (error) {
    res.status(400).send(error);
  }
});
app.get("/not_premium_user", async (req, res) => {
  try {
    const premium = req.query.premium;
    const filter = { premium: premium === "false" };
    var data = await Recruiters.find(filter);
    res.status(200).json(data);
  } catch (error) {
    res.status(400).send(error);
  }
});
app.get("/premium_user/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: id };
  const date = await Recruiters.findOne(query);
  res.send(date);
});

// company and profile verify doc and verify

app.get("/verifyCompny", async (req, res) => {
  try {
    var data = await CompanyVerify.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/company_varify/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: id };
  const date = await CompanyVerify.findOne(query);
  res.send(date);
});

app.get("/verifyProfile", async (req, res) => {
  try {
    var data = await ProfileVerify.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/profile_varify/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: id };
  const date = await ProfileVerify.findOne(query);
  res.send(date);
});

////////

// company and profile verify doc and verify

app.get("/verifyRecruterCompny", async (req, res) => {
  const id = req.query._id;
  const query = { _id: id };
  console.log(query);
  const date = await Recruiters.findOne(query);
  res.send(date);
});

app.patch("/verifyRecruterCompny/:_id", async (req, res) => {
  const id = req.params._id;
  const filter = { _id: id };
  const options = { upsert: true };
  const updateDoc = {
    $set: {
      company_verify: true,
    },
  };
  const result = await Recruiters.findOneAndUpdate(filter, updateDoc, options);
  res.send(result);
});

app.get("/verifyRecruterProfile", async (req, res) => {
  const id = req.query._id;
  const query = { _id: id };
  console.log(query);
  const date = await Recruiters.findOne(query);
  res.send(date);
});

app.patch("/verifyRecruterProfile/:_id", async (req, res) => {
  const id = req.params._id;
  const filter = { _id: id };
  const options = { upsert: true };
  const updateDoc = {
    $set: {
      profile_verify: true,
    },
  };
  const result = await Recruiters.findOneAndUpdate(filter, updateDoc, options);
  res.send(result);
});

// industry list

app.get("/admin/industry", async (req, res) => {
  try {
    var industrydata = await Expertisearea.find().populate("category");
    res.status(200).json(industrydata);
  } catch (error) {
    res.status(400).send(error);
  }
});

// industry add
app.post("/industryadd", async (req, res) => {
  try {
    var industrydata = await Expertisearea.findOne({
      industryname: req.body.industryname,
    });
    if (industrydata == null) {
      await Expertisearea({ industryname: req.body.industryname }).save();
      res.json({ message: "industry add successfull" });
    } else {
      res.status(400).json({ message: "industry already added" });
    }
  } catch (error) {
    res.send(error);
  }
});

app.delete("/admin/industry/:id", async (req, res) => {
  try {
    const result = await Expertisearea.findByIdAndDelete(req.params.id);
    // await Category.deleteMany({industryid: req.params.id})
    // await Functionarea.deleteMany({})
    if (!req.params.id) {
      return res.status(404).send();
    }
    res.send(result);
  } catch (error) {
    res.send(error);
  }
});

//category get

app.get("/admin/category", async (req, res) => {
  try {
    var data = await Category.find().populate(["industryid", "functionarea"]);
    res.status(200).json(data);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post("/categoryadd", async (req, res) => {
  try {
    var categorydata = await Category.findOne({
      categoryname: req.body.categoryname,
    });
    if (categorydata == null) {
      var catdata = await Category({
        categoryname: req.body.categoryname,
        industryid: req.body.industryid,
      });
      catdata.save();
      await Expertisearea.findByIdAndUpdate(req.body.industryid, {
        $push: { category: catdata._id },
      });
      res.json({ message: "Categor add successfull" });
    } else {
      res.status(400).json({ message: "Category already added" });
    }
  } catch (error) {
    res.send(error);
  }
});

app.delete("/admin/category/:id", async (req, res) => {
  try {
    const result = await Category.findByIdAndDelete(req.params.id);
    await Functionarea.deleteMany({ categoryid: req.params.id });
    if (!req.params.id) {
      return res.status(404).send();
    }
    res.send(result);
  } catch (error) {
    res.send(error);
  }
});

// functional area add

app.get("/admin/functionalarea", async (req, res) => {
  try {
    var data = await Functionarea.find().populate(["industryid", "categoryid"]);
    res.json(data);
  } catch (error) {
    res.send(error);
  }
});

app.post("/functionalareaadd", async (req, res) => {
  try {
    var functionaldata = await Functionarea.findOne({
      functionalname: req.body.functionalname,
    });
    if (functionaldata == null) {
      var functionarea = await Functionarea({
        industryid: req.body.industryid,
        categoryid: req.body.categoryid,
        functionalname: req.body.functionalname,
      });
      functionarea.save();
      await Category.findByIdAndUpdate(req.body.categoryid, {
        $push: { functionarea: functionarea._id },
      });
      res.json({ message: "Functional Area add successfull" });
    } else {
      res.status(400).json({ message: "Functional Area already added" });
    }
  } catch (error) {
    res.send(error);
  }
});

app.delete("/admin/functionalarea/:id", async (req, res) => {
  try {
    const result = await Functionarea.findByIdAndDelete(req.params.id);
    if (!req.params.id) {
      return res.status(404).send();
    }
    res.send(result);
  } catch (error) {
    res.send(error);
  }
});

// functionalarea add

app.get("/admin/functionalarea", async (req, res) => {
  try {
    var data = await Functionarea.find().populate(["industryid", "categoryid"]);
    res.json(data);
  } catch (error) {
    res.send(error);
  }
});

app.delete("/admin/functionalarea/:id", async (req, res) => {
  try {
    const result = await Functionarea.findByIdAndDelete(req.params.id);
    if (!req.params.id) {
      return res.status(404).send();
    }
    res.send(result);
  } catch (error) {
    res.send(error);
  }
});

// location

app.get("/admin/location", async (req, res) => {
  try {
    var data = await City.find().populate("divisionid");
    res.json(data);
  } catch (error) {
    res.send(error);
  }
});

app.post("/location", async (req, res) => {
  try {
    var citydata = await City.findOne({ name: req.body.city });
    var divisiondata = await Division.findOne({
      divisionname: req.body.division,
    });
    var city;
    var division;
    if (citydata == null) {
      city = await City({ name: req.body.city });
      city.save();
    }
    if (divisiondata == null) {
      division = await Division({
        divisionname: req.body.division,
        cityid: citydata == null ? city._id : citydata._id,
      });
      division.save();
      await City.findOneAndUpdate(
        { name: req.body.city },
        { $push: { divisionid: division._id } }
      );
      res.status(200).json({ message: "Add Successfull" });
    } else {
      res.status(400).json({ message: "already added" });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

app.delete("/admin/location/:id", async (req, res) => {
  try {
    const result = await City.findByIdAndDelete(req.params.id);
    if (!req.params.id) {
      return res.status(404).send();
    }
    res.send(result);
  } catch (error) {
    res.send(error);
  }
});

// # post salarietype
app.get("/admin/salarie", async (req, res) => {
  try {
    var data = await Salirietype.find();
    res.json(data);
  } catch (error) {
    res.send(error);
  }
});

app.post("/salarietype", async (req, res) => {
  try {
    var saliry = await Salirietype.findOne(req.body);
    if (saliry == null) {
      const salirietypeData = await Salirietype(req.body);
      await salirietypeData.save();
      res.status(200).json({ message: "add successfull" });
    } else {
      res.status(400).json({ message: "allready added" });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

app.delete("/admin/salarie/:id", async (req, res) => {
  try {
    const result = await Salirietype.findByIdAndDelete(req.params.id);
    if (!req.params.id) {
      return res.status(404).send();
    }
    res.send(result);
  } catch (error) {
    res.send(error);
  }
});

// # get jobtype data

app.get("/admin/jobtype", async (req, res) => {
  try {
    const jobtypeData = await Jobtype.find();
    res.send(jobtypeData);
  } catch (error) {
    res.send(error);
  }
});

app.post("/jobtype", async (req, res) => {
  try {
    var jobtype = await Jobtype.findOne(req.body);
    if (jobtype == null) {
      const jobtypeData = await Jobtype(req.body);
      const jobData = await jobtypeData.save();
      res.status(200).send(jobData);
    } else {
      res.status(400).json({ message: "allready added" });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

app.delete("/admin/jobtype/:id", async (req, res) => {
  try {
    const result = await Jobtype.findByIdAndDelete(req.params.id);
    if (!req.params.id) {
      return res.status(404).send();
    }
    res.send(result);
  } catch (error) {
    res.send(error);
  }
});

app.get("/admin/digree", async (req, res) => {
  try {
    const Data = await Digree.find().populate(["education", "subject"]);
    res.send(Data);
  } catch (error) {
    res.send(error);
  }
});

app.delete("/admin/digree/:id", async (req, res) => {
  try {
    const result = await Digree.findByIdAndDelete(req.params.id);
    if (!req.params.id) {
      return res.status(404).send();
    }
    res.send(result);
  } catch (error) {
    res.send(error);
  }
});

app.delete("/admin/education_lavel/:id", async (req, res) => {
  try {
    var data = await EducationLavel.findOneAndDelete({
      _id: req.params.id,
    });
    if (data == null) {
      res.status(400).json({ message: "iteam not found" });
    } else {
      await Digree.findOneAndUpdate({ $pull: { digree: data._id } });
      await Subject.findOneAndUpdate({ $pull: { educaton: data._id } });
      res.status(200).json({ message: "Delete Sucessfull" });
    }
  } catch (error) {
    res.send(error);
  }
});

app.delete("/admin/education_lavel/:id", async (req, res) => {
  try {
    const result = await EducationLavel.findByIdAndDelete(req.params.id);
    if (!req.params.id) {
      return res.status(404).send();
    }
    res.send(result);
  } catch (error) {
    res.send(error);
  }
});

app.get("/admin/subject", async (req, res) => {
  try {
    const Data = await Subject.find().populate(["educaton", "digree"]);
    res.send(Data);
  } catch (error) {
    res.send(error);
  }
});

app.delete("/admin/subject/:id", async (req, res) => {
  try {
    const result = await Subject.findByIdAndDelete(req.params.id);
    if (!req.params.id) {
      return res.status(404).send();
    }
    res.send(result);
  } catch (error) {
    res.send(error);
  }
});

app.post("/education_lavel", async (req, res) => {
  try {
    var data = await EducationLavel.findOne(req.body);
    if (data == null) {
      await EducationLavel(req.body).save();
      res.status(200).json({ message: "add successfull" });
    } else {
      res.status(200).json({ message: "all ready added" });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/education_lavel", async (req, res) => {
  try {
    var data = await EducationLavel.find().populate([
      { path: "digree", select: "-subject" },
    ]);
    res.status(200).send(data);
  } catch (error) {
    res.send(error);
  }
});

app.post("/digree_add", async (req, res) => {
  try {
    var data = await Digree.findOne({ name: req.body.name });
    if (data == null) {
      var digreedata = await Digree({
        name: req.body.name,
        education: req.body.education,
      });
      digreedata.save();
      await EducationLavel.findOneAndUpdate(
        { _id: req.body.education },
        { $push: { digree: digreedata._id } }
      );
      res.status(200).json({ message: "add successfull" });
    } else {
      res.status(200).json({ message: "all ready added" });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post("/subject_add", async (req, res) => {
  try {
    var data = await Subject.findOne({ name: req.body.name });
    if (data == null) {
      var subjectdata = await Subject(req.body);
      subjectdata.save();
      await Digree.findOneAndUpdate(
        { _id: req.body.digree },
        { $push: { subject: subjectdata._id } }
      );
      res.status(200).json({ message: "add successfull" });
    } else {
      res.status(200).json({ message: "all ready added" });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/subject", async (req, res) => {
  try {
    var data = await Subject.find({
      name: { $regex: req.query.name, $options: "i" },
    });
    res.status(200).send(data);
  } catch (error) {
    res.status(400).send(error);
  }
});

// experience insert

app.post("/experience", async (req, res) => {
  try {
    var experidata = await Experince.findOne({ name: req.body.name });
    if (experidata != null) {
      res.json({ message: "experience allready available" });
    } else {
      await Experince({ name: req.body.name }).save();
      res.json({ message: "experience insert successfull" });
    }
  } catch (error) {
    res.send(error);
  }
});

module.exports = app;