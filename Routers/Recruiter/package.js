const express = require("express");
const app = express();
const tokenverify = require("../../MiddleWare/tokenverify.js");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const Recruiters = require("../../Model/Recruiter/recruiters");
const Package = require("../../Model/Package/package.js");
const PackageBuy = require("../../Model/Package/package_buy.js");
const axios = require("axios");
const moment = require("moment");
var moment2 = require("moment-timezone");
moment2().tz("Asia/Dhaka").format();
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

const BKASH_USERNAME = process.env.BKASH_USERNAME;
const BKASH_PASSWORD = process.env.BKASH_PASSWORD;
const BKASH_APP_KEY = process.env.BKASH_APP_KEY;
const BKASH_APP_SECRET = process.env.BKASH_APP_SECRET;
const BKASH_BASE_URL = process.env.BKASH_BASE_URL;

app.post("/packagebuy", tokenverify, async (req, res) => {
  try {
    const id = req.userId;
    let startdate = moment.tz(moment(new Date()), "Asia/Dhaka");
    let enddate = moment.tz(moment(new Date()), "Asia/Dhaka");
    let lastdate = enddate.add(1, "month");
    const token = await findbKashToken();

    const bkashdata = await getPaymentStatus(req.body.transactionID, token);
    console.log(bkashdata);

    if (bkashdata?.transactionStatus != "Completed") {
      return res
        .status(400)
        .json({ message: "Payment request is not successful" });
    }

    var packagedata = await PackageBuy.findOne({
      recruiterid: id,
      packageid: req.body.packageid,
      active: true,
    });
    if (packagedata == null) {
      var pack = await PackageBuy({
        transactionID: bkashdata,
        recruiterid: id,
        packageid: req.body.packageid,
        starddate: startdate,
        enddate: lastdate,
        expireAt: lastdate,
      });
      pack.save();
      await Recruiters.findOneAndUpdate(
        { _id: id },
        { $set: { "other.package": pack._id, "other.premium": true } }
      );
      res.status(200).json({ message: "Package buy successfully" });
    } else {
      res.status(400).json({ message: "Already buy a package" });
    }
  } catch (error) {
    res.send("test error:", error);
  }
});

app.get("/user_payment_history", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const id = req.userId;
    var data = await PackageBuy.find({ recruiterid: id }).populate([
      { path: "packageid" },
      { path: "recruiterid" },
    ]);
    res.status(200).send(data);
  } catch (error) {
    res.send(error);
  }
});

app.post("/subscription_cancle", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const id = req.userId;
    var data = await PackageBuy.findOneAndDelete({
      recruiterid: id,
      _id: req.body.id,
    });
    if (data == null) {
      res.status(200).json({ message: "active package not found" });
    } else {
      await Recruiters.findOneAndUpdate(
        { _id: id },
        { $set: { "other.premium": false, "other.package": null } }
      );

      //delete other.package

      res.status(200).json({ message: "Subscription cancel successfully" });
    }
  } catch (error) {
    res.send(error);
  }
});

// Function to initiate bKash payment
const initiateBkashPayment = async (requestData, token) => {
  const headers = {
    "x-app-key": "4f6o0cjiki2rfm34kfdadl1eqq",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.post(
      `${BKASH_BASE_URL}/v1.2.0-beta/tokenized/checkout/create`,
      requestData,
      { headers }
    );
    return response.data;
    z;
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

app.post("/buy_package_with_bkash", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const id = req.userId;

    try {
      const packageData = await PackageBuy.findOne({
        recruiterid: id,
        active: true,
      }).populate("packageid");

      if (!packageData) {
        return res.status(400).json({ message: "No active package found" });
      }

      const amount = packageData.packageid.amount;

      const requestData = {
        callbackURL: "http://localhost:3002/bkash/agreement/callback",
        payerReference: "01770618575",
        mode: "0011",
        amount: amount.toString(),
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: "Inv0124",
      };

      const token = await findbKashToken();

      const bkashPaymentInfo = await initiateBkashPayment(requestData, token);

      res.json({
        bkashURL: bkashPaymentInfo.bkashURL,
        amount: bkashPaymentInfo.amount,
      });
    } catch (initiateBkashError) {
      console.error(
        "Error initiating bKash payment:",
        initiateBkashError.response
      );
      res.status(500).json({ message: "Internal server error" });
    }
  } catch (error) {
    res.status(500).send(error.message);
    console.log(error);
  }
});

const findbKashToken = async () => {
  const app_key = BKASH_APP_KEY;
  const app_secret = BKASH_APP_SECRET;

  const data = {
    app_key: app_key,
    app_secret: app_secret,
  };

  console.log("Request Data:", data);

  const config = {
    headers: {
      "Content-Type": "application/json",
      username: BKASH_USERNAME,
      password: BKASH_PASSWORD,
    },
  };

  try {
    const response = await axios.post(
      `${BKASH_BASE_URL}/v1.2.0-beta/tokenized/checkout/token/grant`,
      data,
      config
    );
    console.log(response.data);
    return response.data.id_token;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getPaymentStatus = async (paymentID, token) => {
  const headers = {
    "x-app-key": BKASH_APP_KEY,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const requestData = { trxID: paymentID };

  try {
    const response = await axios.post(
      `${BKASH_BASE_URL}/v1.2.0-beta/tokenized/checkout/general/searchTransaction`,
      requestData,
      { headers }
    );
    console.log("Response Data:", response.data);
    return response.data;
  } catch (error) {
    // console.error(
    //   'Error:',
    //   error.response ? error.response.data : error.message
    // );
    // throw error;
  }
};

const makeBkashRequest = async (url, requestData, token) => {
  const headers = {
    "x-app-key": BKASH_APP_KEY,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.post(url, requestData, { headers });
    return response.data;
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

app.post("/packagebuywithBkash", tokenverify, async (req, res) => {
  try {
    const token = req.token;
    const id = req.userId;

    const statusToken = await findbKashToken();

    const requestData = {
      paymentID: paymentID,
    };

    try {
      const token = req.token;
      const bkashPaymentData = await makeBkashRequest(
        `${BKASH_BASE_URL}/v1.2.0-beta/tokenized/checkout/payment/status`,
        requestData,
        token
      );

      if (bkashPaymentData && bkashPaymentData.status === "success") {
        const paymentID = bkashPaymentData.paymentID;

        const statusData = await getPaymentStatus(paymentID, statusToken);

        console.log("Payment Status Data:", statusData);

        if (
          statusData.statusMessage &&
          statusData.statusMessage.toLowerCase() === "successful"
        ) {
          let startdate = moment.tz(moment(new Date()), "Asia/Dhaka");
          let enddate = moment.tz(moment(new Date()), "Asia/Dhaka");
          let lastdate = enddate.add(1, "month");

          console.log(startdate.format("yyyy-MM-dd hh:mm:ss a"));

          const packagedata = await PackageBuy.findOne({
            recruiterid: id,
            packageid: req.body.packageid,
            active: true,
          });

          if (packagedata == null) {
            const pack = await PackageBuy({
              transactionID: paymentID,
              recruiterid: id,
              packageid: req.body.packageid,
              starddate: startdate,
              enddate: lastdate,
              expireAt: lastdate,
            });
            pack.save();
            await Recruiters.findOneAndUpdate(
              { _id: id },
              { $set: { "other.package": pack._id, "other.premium": true } }
            );
            res.status(200).json({ message: "Package buy successful" });
          } else {
            res.status(400).json({ message: "Already bought a package" });
          }
        } else {
          res
            .status(400)
            .json({ message: "Payment request is not successful" });
        }
      } else {
        res.status(400).json({ message: "Payment initiation failed" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).send("Internal server error");
  }
});

module.exports = app;
