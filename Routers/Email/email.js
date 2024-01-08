const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const { email } = require("../../Model/emaillogin.js");

app.post("/email_singup", async (req, res) => {
  const adminUser = await email(req.body);
  const data = await adminUser.save();
  res.json(data);
});

// context user
app.get("/user", async (req, res) => {
  const emaild = req.query.email;
  const query = { email: emaild };
  const users = await email.findOne(query);
  res.send(users);
});
app.post("/admin_jwt", (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
    expiresIn: "1y",
  });
  res.send({ token });
});

app.post("/appadmin/:_id", async (req, res) => {
  try {
    const _id = req.params._id;
    await email.findByIdAndUpdate(
      _id,
      {
        $set: {
          addAdmin: false,
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

app.post("/v_appadmin/:_id", async (req, res) => {
  try {
    const _id = req.params._id;
    await email.findByIdAndUpdate(
      _id,
      {
        $set: {
          addAdmin: true,
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

app.post("/webadmin/:_id", async (req, res) => {
  try {
    const _id = req.params._id;
    await email.findByIdAndUpdate(
      _id,
      {
        $set: {
          webAdmin: false,
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

app.post("/v_webadmin/:_id", async (req, res) => {
  try {
    const _id = req.params._id;
    await email.findByIdAndUpdate(
      _id,
      {
        $set: {
          webAdmin: true,
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

app.get("/all_admin_user", async (req, res) => {
  try {
    var all_admin_user = await email.find();
    res.status(200).json(all_admin_user);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/user_app/:email", async (req, res) => {
  const emailid = req.params.email;
  const query = { email: emailid };
  const appPerson = await email.findOne(query);
  res.send({ isApp: appPerson?.addAdmin === true });
});

app.get("/user_web/:email", async (req, res) => {
  const emailid = req.params.email;
  const query = { email: emailid };
  const webPerson = await email.findOne(query);
  res.send({ isWeb: webPerson?.webAdmin === true });
});

app.get("/user_main/:email", async (req, res) => {
  const emailid = req.params.email;
  const query = { email: emailid };
  const mainperson = await email.findOne(query);
  res.send({ isAdmin: mainperson?.admin === true });
});

module.exports = app;

// { displayName: req.body.displayName },
// { email: req.body.email },
// { photoURL: req.body.photoURL },
// { appAdmin: req.body.appAdmin },
// { webAdmin: req.body.webAdmin }
// , { message: "user successfull" }
