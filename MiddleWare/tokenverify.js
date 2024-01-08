const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  // Get auth header value
  const bearerHeader = req.headers["authorization"];
  // Check if bearer is undefined
  if (typeof bearerHeader !== "undefined") {
    // Split at the space
    const bearer = bearerHeader.split(" ");
    // Get token from array
    const bearerToken = bearer[1];
    // Set the token
    try {
      var decoded = jwt.verify(bearerToken, process.env.ACCESS_TOKEN);
    } catch (error) {
      res.status(401).json({ message: "invalid token" });
    }
    req.token = bearerToken;
    req.userId = decoded._id;
    req.userNumber = decoded.number;
    // Next middleware
    next();
  } else {
    // Forbidden
    res.sendStatus(403);
  }
}

module.exports = verifyToken;
