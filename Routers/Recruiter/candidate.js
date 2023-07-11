const express = require("express");
const app = express();
const Recruiters = require("../../Model/Recruiter/recruiters");
const tokenverify = require("../../MiddleWare/tokenverify.js")
const jwt = require('jsonwebtoken');
const RecruiterFunctionarea = require("../../Model/Recruiter/Recruiter_Functionarea/recruiter_functionarea.js")
const multer = require("multer");
const JobPost = require('../../Model/Recruiter/Job_Post/job_post.js')
const candidatesave = require("../../Model/Recruiter/Candidate_Save/candidate_save")
const candidateReport = require("../../Model/Recruiter/Candidate_Report/candidate_report")
const {
    Profiledata,
} = require("../../Model/Seeker_profile_all_details.js");
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



app.get("/candidate_functionalarea", tokenverify, async (req, res) => {

    try {
        jwt.verify(req.token, process.env.ACCESS_TOKEN, async (err, authdata) => {
            if (err) {
                res.json({ message: "invalid token" })
            } else {
                const _id = authdata._id;
                var candidate_function = await RecruiterFunctionarea.find({ userid: _id }).sort('-updatedAt').limit(5).select("expertice_area").populate({ path: "expertice_area", select: "functionalname" })
                res.status(200).send(candidate_function)
            }
        })
    } catch (error) {
        res.status(400).send(error);
    }
})


app.post("/add_candidate_functional", tokenverify, async (req, res) => {
    try {
        jwt.verify(req.token, process.env.ACCESS_TOKEN, async (err, authdata) => {
            if (err) {
                res.json({ message: "invalid token" })
            } else {
                const _id = authdata._id;
                var candidate_function = await RecruiterFunctionarea.findOneAndUpdate({ userid: _id, expertice_area: req.body.expertice_area }, {
                    $set: {
                        expertice_area: req.body.expertice_area
                    }
                })
                if (candidate_function == null) {
                    await RecruiterFunctionarea({ userid: _id, expertice_area: req.body.expertice_area }).save()
                    res.status(200).json({ message: "Functional Area add successfull" })
                } else {
                    res.status(200).json({ message: "Functional Area Update" })
                }

            }
        })
    } catch (error) {
        res.status(400).send(error);
    }
})


app.get("/candidatelist", tokenverify, async (req, res) => {
    try {
        jwt.verify(req.token, process.env.ACCESS_TOKEN, async (err, authdata) => {
            if (err) {
                res.json({ message: "invalid token" })
            } else {
                const _id = authdata._id;
                var profiledata = await Recruiters.findOne({ _id: _id }).populate([{path: "companyname"}])
                function functionalareafilter(element) {
                    if(element.functionalarea._id == req.query.functionalareaid && (new RegExp(element.division.cityid.name.toLowerCase())).test(profiledata.companyname.c_location.formet_address.toLowerCase()) == true) {
                        return true;
                    }else{
                        return false;
                    }
                  }
                  function industryfilter(element) {
                    var data = element.category.filter((data)=> data.industryid == profiledata.companyname.industry)
                    if (data.length > 0 && (new RegExp(element.division.cityid.name.toLowerCase())).test(profiledata.companyname.c_location.formet_address.toLowerCase()) == true) {
                        return true;
                    }else{
                        return false;
                    }
                  }
                if (req.query.functionalareaid == 0) {
                    var populate = [
                        { path: "workexperience", populate: [{ path: "category", select: "-functionarea" }, "expertisearea"] },
                        { path: "education", populate: [{ path: "digree", select: "-subject", populate: { path: "education", select: "-digree" } }, "subject"] },
                        "skill",
                        "protfoliolink",
                        "about",
                        { path: "careerPreference", populate: [{ path: "category",  select: "-functionarea" }, { path: "functionalarea" }, { path: "division", populate: { path: "cityid", select: "-divisionid" } }, "jobtype",  { path: "salaray.min_salary", select: "-other_salary" },
                        { path: "salaray.max_salary", select: "-other_salary" },] },
                        { path: "userid", populate: { path: "experiencedlevel" } }
                    ]
                    
                    var seekerdata = await Profiledata.find().populate(populate).then((data)=> data.filter((filterdata)=> {
                        var industrydata = filterdata.careerPreference.filter(industryfilter)
                        if(industrydata.length > 0){
                            return true;
                        }else{
                            return false;
                        }

                    }));
                    res.status(200).send(seekerdata)
                } else {
                    var populate2 =[
                        { path: "workexperience", populate: [{ path: "category",  select: "-functionarea" }, "expertisearea"] },
                        { path: "education", populate: [{ path: "digree", select: "-subject", populate: { path: "education", select: "-digree" } }, "subject"] },
                        "skill",
                        "protfoliolink",
                        "about",
                        { path: "careerPreference", populate: [{ path: "category", select: "-functionarea" }, { path: "functionalarea", populate: [{path: "industryid", select: "-category"}]}, { path: "division", populate: { path: "cityid", select: "-divisionid" } }, "jobtype",  { path: "salaray.min_salary", select: "-other_salary" },
                        { path: "salaray.max_salary", select: "-other_salary" },] },
                        { path: "userid", populate: { path: "experiencedlevel" } }
                    ]
                    var seekerdata = await Profiledata.find().populate(populate2).then((data) => data.filter((filterdata) => {
                        var filterdata2 = filterdata.careerPreference.filter(functionalareafilter)
                        if (filterdata2.length > 0) {
                            return true;
                        }else{
                            return false;
                        }
                    }));
                    res.status(200).send(seekerdata)
                }
            }
        })
    } catch (error) {
        res.status(400).send(error);
    }

})


app.post("/candidate_save", tokenverify, async (req, res) => {
    try {
        jwt.verify(req.token, process.env.ACCESS_TOKEN, async (err, authdata) => {
            if (err) {
                res.json({ message: "invalid token" })
            } else {
                const _id = authdata._id;
                var data = await candidatesave.findOne({ userid: _id, candidatefullprofile: req.body.candidatefullprofile })
                if (data == null) {
                    await candidatesave({ userid: _id, candidateid: req.body.candidateid, candidatefullprofile: req.body.candidatefullprofile }).save()
                    await Recruiters.findOneAndUpdate({_id: _id}, {$inc: {"other.savecandidate": 1}})
                    res.status(200).json({ message: "candidate save successfull" })
                } else {
                    await candidatesave.findOneAndDelete({ _id: data._id })
                    await Recruiters.findOneAndUpdate({_id: _id}, {$inc: {"other.savecandidate": -1}})
                    res.status(200).json({ message: "candidate unsave successfull" })
                }
            }
        })
    } catch (error) {
        res.status(400).send(error);
    }
})

app.get("/candidate_save", tokenverify, async (req, res) => {
    try {
        jwt.verify(req.token, process.env.ACCESS_TOKEN, async (err, authdata) => {
            if (err) {
                res.json({ message: "invalid token" })
            } else {
                const _id = authdata._id;

                var data = await candidatesave.find({ userid: _id }).populate({
                    path: "candidatefullprofile", populate: [{ path: "workexperience", populate: [{ path: "category", select: "-functionarea" }, "expertisearea"] },
                    { path: "education", populate: [{ path: "digree", select: "-subject", populate: { path: "education", select: "-digree" } }, "subject"] },
                        "skill",
                        "protfoliolink",
                        "about",
                    { path: "careerPreference", populate: [{ path: "category", select: "-functionarea" }, { path: "functionalarea" }, { path: "division", populate: { path: "cityid", select: "-divisionid" } }, "jobtype",  { path: "salaray.min_salary", select: "-other_salary" },
                    { path: "salaray.max_salary", select: "-other_salary" },] },
                    { path: "userid", populate: { path: "experiencedlevel" } }]
                })
                res.status(200).send(data)
            }
        })
    } catch (error) {
        res.status(400).send(error);
    }
})


app.post("/candidate_report", tokenverify, upload.single("image"), async (req, res) => {
    try {
        jwt.verify(req.token, process.env.ACCESS_TOKEN, async (err, authdata) => {
            if (err) {
                res.json({ message: "invalid token" })
            } else {
                const _id = authdata._id;
                var reportdata = await candidateReport.findOne({ userid: _id, candidateid: req.body.candidateid })
                if (reportdata == null) {
                    await candidateReport({ userid: _id, candidateid: req.body.candidateid, report: req.body.report, image: req.file == null ? "" : req.file.path , description: req.body.description}).save()
                    res.status(200).json({ message: "report successfull" })
                } else {
                    await candidateReport.findOneAndUpdate({ userid: _id, candidateid: req.body.candidateid }, {
                        $set: {
                            report: req.body.report, image: req.file == null ? "" : req.file.path, description: req.body.description
                        }
                    })
                    res.status(200).json({ message: "you job report update" })
                }
            }
        })
    } catch (error) {
        res.status(400).send(error);
    }

})


app.get("/candidate_search", tokenverify, async (req, res) => {
    try {
        jwt.verify(req.token, process.env.ACCESS_TOKEN, async (err, authdata) => {
            if (err) {
                res.json({ message: "invalid token" })
            } else {
                const _id = authdata._id;
                // var company = await Profiledata.find({job_title: {$regex: req.query.search, $options: "i"} }).populate(["userid",
                //         "expertice_area",
                //         "experience",
                //         "education",
                //         "salary",
                //         { path: "company",match: { "c_location.formet_address": { $regex: req.query.city ?? "", $options: "i" } }, populate: [{ path: "c_size" }, { path: "industry", select: "-category" }] },
                //         "skill",
                //         "jobtype"]).then((data) => data.filter((filterdata) => filterdata.company != null))

                var seekerdata = await Profiledata.find().populate(
                    [
                        { path: "workexperience", populate: [{ path: "category", select: "-functionarea" }, "expertisearea"] },
                        { path: "education", populate: [{ path: "digree", select: "-subject", populate: { path: "education", select: "-digree" } }, "subject"] },
                        "skill",
                        "protfoliolink",
                        "about",
                        { path: "careerPreference", populate: [{ path: "category", select: "-functionarea" }, { path: "functionalarea" }, { path: "division", populate: { path: "cityid", select: "-divisionid" } }, "jobtype",  { path: "salaray.min_salary", select: "-other_salary" },
                        { path: "salaray.max_salary", select: "-other_salary" },] },
                        { path: "userid", match: { "fastname": { $regex: req.query.name, $options: "i" } }, populate: { path: "experiencedlevel" } }
                    ]
                ).then((data) => data.filter((filterdata) => filterdata.userid != null));
                res.status(200).send(seekerdata);

            }
        })
    } catch (error) {
        res.status(400).send(error);
    }
})



app.post('/candidate_filter', tokenverify, async (req, res) => {
    try {
        jwt.verify(req.token, process.env.ACCESS_TOKEN, async (err, authdata) => {
            if (err) {
                res.json({ message: "invalid token" })
            } else {
                const _id = authdata._id;
                var workplace = req.body.workplace
                var education = req.body.education
                var salary = req.body.salary
                var experience = req.body.experience
                var industry = req.body.industry
                var companysize = req.body.companysize
                var populate = [
                    { path: "workexperience", populate: [{ path: "category", select: "-functionarea" }, "expertisearea"] },
                    { path: "education", populate: [{ path: "digree", select: "-subject", populate: { path: "education", select: "-digree" } }, "subject"] },
                    "skill",
                    "protfoliolink",
                    "about",
                    { path: "careerPreference" , populate: [{ path: "category", select: "-functionarea" }, { path: "functionalarea"}, { path: "division", populate: { path: "cityid", select: "-divisionid" } }, "jobtype",  { path: "salaray.min_salary", select: "-other_salary" },
                    { path: "salaray.max_salary", select: "-other_salary" },] },
                    { path: "userid",  populate: { path: "experiencedlevel" , match: {_id: {$in: experience}}} }
                ]
                
                function industryfilter(element) {
                    if(industry.some((e)=> element.functionalarea.industryid == e) && salary.some((e)=> element.salaray._id == e)){
                        return true;
                    }else{
                        return false;
                    }
                  }
                  function educationfilter(element) {
                    if(education.some((e)=> element.digree.education._id == e)){
                        return true;
                    }else{
                        return false;
                    }
                    
                  }

                var seekerdata = await Profiledata.find().populate(populate)
                .then((data) => data.filter((filterdata) => {
                    var filterdata2 = filterdata.careerPreference.filter(industryfilter)
                    var educationdata2 = filterdata.education.filter(educationfilter)
                    
                    if (filterdata2.length > 0 && educationdata2.length > 0 && filterdata.userid.experiencedlevel != null) {
                        
                        return true;
                        
                    }else{
                        return false;
                    }
                    
                    
                }));
                res.status(200).send(seekerdata)
            }
        })
    } catch (error) {
        res.status(400).send(error);
    }
})


module.exports = app;